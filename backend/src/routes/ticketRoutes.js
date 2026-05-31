import express from 'express';
import { 
  createTicket, 
  getTickets, 
  getTicketById, 
  claimTicket, 
  updateTicketStatus, 
  addMessage, 
  getTicketMessages,
  getAgentStats,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  updateTicketSolutionWorkaround,
  addTicketAttachments,
  deleteTicketAttachment,
  getErrorTypes,
  createErrorType,
  updateErrorType,
  deleteErrorType,
  getProgramTypes,
  createProgramType,
  updateProgramType,
  deleteProgramType,
  getIssueTypes,
  createIssueType,
  updateIssueType,
  deleteIssueType
} from '../controllers/ticketController.js';
import { authenticateToken, requireAgent } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Dynamic Config Routes (must place before /:id routes to avoid clash)
router.get('/config/categories', getCategories);
router.post('/config/categories', requireAgent, createCategory);
router.put('/config/categories/:name', requireAgent, updateCategory);
router.delete('/config/categories/:name', requireAgent, deleteCategory);

router.get('/config/error-types', getErrorTypes);
router.post('/config/error-types', requireAgent, createErrorType);
router.put('/config/error-types/:id', requireAgent, updateErrorType);
router.delete('/config/error-types/:id', requireAgent, deleteErrorType);

router.get('/config/program-types', getProgramTypes);
router.post('/config/program-types', requireAgent, createProgramType);
router.put('/config/program-types/:id', requireAgent, updateProgramType);
router.delete('/config/program-types/:id', requireAgent, deleteProgramType);

router.get('/config/issue-types', getIssueTypes);
router.post('/config/issue-types', requireAgent, createIssueType);
router.put('/config/issue-types/:id', requireAgent, updateIssueType);
router.delete('/config/issue-types/:id', requireAgent, deleteIssueType);

router.get('/config/modules', getModules);
router.post('/config/modules', requireAgent, createModule);
router.put('/config/modules/:name', requireAgent, updateModule);
router.delete('/config/modules/:name', requireAgent, deleteModule);

router.get('/config/roles', getRoles);
router.post('/config/roles', requireAgent, createRole);
router.put('/config/roles/:id', requireAgent, updateRole);
router.delete('/config/roles/:id', requireAgent, deleteRole);

// Ticket CRUD & Queries
router.post('/', upload.array('attachments', 10), createTicket);
router.get('/', getTickets);
router.get('/stats', requireAgent, getAgentStats); // Stats only for agents
router.get('/:id', getTicketById);

// Ticket Assign/Status updates
router.post('/:id/claim', requireAgent, claimTicket);
router.put('/:id/status', updateTicketStatus);
router.put('/:id/solution-workaround', requireAgent, updateTicketSolutionWorkaround);
router.post('/:id/attachments', upload.array('attachments', 10), addTicketAttachments);
router.delete('/:id/attachments/:attachmentId', deleteTicketAttachment);

// Chat messaging
router.post('/:id/messages', addMessage);
router.get('/:id/messages', getTicketMessages);

export default router;
