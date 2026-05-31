import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeyforapexsupportdesk2026!';

// 1. Register User
export const register = async (req, res) => {
  const { name, email, password, role, custNum } = req.body;

  // Simple validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email and password' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  // Validate password strength (at least 6 chars, 1 lowercase, 1 uppercase, 1 digit, 1 special char)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร และประกอบด้วยตัวอักษรพิมพ์เล็ก (a-z) พิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษอย่างน้อยอย่างละ 1 ตัว' 
    });
  }

  // Validate role
  const userRole = role === 'agent' ? 'agent' : 'customer';

  try {
    // Check if email already exists
    const emailExistCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (emailExistCheck.rows.length > 0) {
      return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานแล้วในระบบ (This email is already registered)' });
    }

    // Check if name (username) already exists
    const nameExistCheck = await pool.query('SELECT * FROM users WHERE LOWER(name) = LOWER($1)', [name.trim()]);
    if (nameExistCheck.rows.length > 0) {
      return res.status(400).json({ error: 'ชื่อผู้ใช้งานนี้ถูกใช้งานแล้วในระบบ (This username is already taken)' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into DB
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, cust_num) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, cust_num, is_verified, created_at',
      [name, email.toLowerCase(), passwordHash, userRole, custNum || null]
    );

    const user = newUser.rows[0];

    return res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จแล้ว! กรุณารอการตรวจสอบและอนุมัติการใช้งานจากผู้ดูแลระบบก่อนเข้าใช้งาน (Registration successful! Pending administrator approval)',
      pendingApproval: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ error: 'Server error during registration' });
  }
};

// 2. Login User
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    // Find user in DB and resolve base_role
    const userResult = await pool.query(`
      SELECT u.*, COALESCE(r.base_role, u.role) as base_role 
      FROM users u 
      LEFT JOIN roles r ON LOWER(u.role) = LOWER(r.name) 
      WHERE u.email = $1
    `, [email.toLowerCase()]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check if user is verified
    if (user.is_verified === false) {
      return res.status(403).json({ 
        error: 'บัญชีของคุณยังไม่ได้รับการอนุมัติการใช้งานจากผู้ดูแลระบบ กรุณารอการตรวจสอบและอนุมัติ (Your account is pending administrator approval)' 
      });
    }

    // Generate JWT token (use base_role for permissions in token)
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.base_role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.base_role,
        display_role: user.role,
        cust_num: user.cust_num,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

// 3. Get User Profile
export const getProfile = async (req, res) => {
  try {
    const userResult = await pool.query(`
      SELECT u.id, u.name, u.email, COALESCE(r.base_role, u.role) as role, u.role as display_role, u.cust_num, u.created_at
      FROM users u
      LEFT JOIN roles r ON LOWER(u.role) = LOWER(r.name)
      WHERE u.id = $1
    `, [req.user.id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(userResult.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ error: 'Server error fetching profile' });
  }
};

// 4. Get All Users (Agent Only)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.cust_num, u.is_verified, u.created_at,
              (SELECT COUNT(*) FROM tickets WHERE customer_id = u.id) as ticket_count,
              (SELECT COUNT(*) FROM tickets WHERE agent_id = u.id) as assigned_count,
              (SELECT JSON_AGG(JSON_BUILD_OBJECT('id', id, 'title', title, 'status', status)) FROM tickets WHERE agent_id = u.id) as assigned_tickets
       FROM users u
       ORDER BY u.created_at DESC`
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Server error while fetching members.' });
  }
};

// 5. Update User Data (Agent Only)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  let { role, custNum, is_verified } = req.body;

  if (parseInt(id, 10) === req.user.id && role && role.toLowerCase() !== (req.user.user_role || req.user.role).toLowerCase()) {
    return res.status(400).json({ error: 'You cannot change your own role to prevent lockout.' });
  }

  try {
    // Validate that the role exists in roles table
    if (role) {
      const roleCheck = await pool.query('SELECT name FROM roles WHERE LOWER(name) = LOWER($1)', [role]);
      if (roleCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid role.' });
      }
      role = roleCheck.rows[0].name; // ensure exact casing
    }

    const result = await pool.query(
      `UPDATE users 
       SET role = COALESCE($1, role), 
           cust_num = COALESCE($2, cust_num),
           is_verified = CASE WHEN $3::boolean IS NULL THEN is_verified ELSE $3::boolean END
       WHERE id = $4 
       RETURNING id, name, email, role, cust_num, is_verified`,
      [role || null, custNum || null, is_verified !== undefined ? is_verified : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      message: 'User updated successfully.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Server error while changing member role.' });
  }
};

// 6. Delete User (Agent Only)
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (parseInt(id, 10) === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Server error while deleting member.' });
  }
};

// 7. Update Profile
export const updateProfile = async (req, res) => {
  const { name, custNum } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, cust_num = $2
       WHERE id = $3
       RETURNING id, name, email, role, cust_num, created_at`,
      [name.trim(), custNum ? custNum.trim() : null, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Server error while updating profile.' });
  }
};

// 8. Change Password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ 
      error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร และประกอบด้วยตัวอักษรพิมพ์เล็ก (a-z) พิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษอย่างน้อยอย่างละ 1 ตัว' 
    });
  }

  try {
    // Get user from DB with password_hash
    const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }

    const user = userResult.rows[0];

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password in DB
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, req.user.id]);

    return res.status(200).json({
      message: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่านบนเซิร์ฟเวอร์' });
  }
};


