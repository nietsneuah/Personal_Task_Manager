import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TaskForm from '../../components/TaskForm';

// Mock the database
vi.mock('../../db/priorityDB', () => {
  const mockAdd = vi.fn().mockResolvedValue(1);
  const mockUpdate = vi.fn().mockResolvedValue(1);
  const mockGet = vi.fn();
  
  return {
    db: {
      tasks: {
        add: mockAdd,
        update: mockUpdate,
        get: mockGet
      }
    },
    PriorityTask: vi.fn(),
    PriorityDB: vi.fn()
  };
});

// Import the mocked db after mocking
import { db } from '../../db/priorityDB';

// Mock the react-router-dom useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams
  };
});

// Mock navigate function
const mockNavigate = vi.fn();
let mockParams = {};

describe('TaskForm Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = {}; // Reset params
  });

  // Helper function to render the component with router
  const renderTaskForm = () => {
    return render(
      <MemoryRouter initialEntries={['/task/new']}>
        <Routes>
          <Route path="/task/new" element={<TaskForm />} />
          <Route path="/task/:id" element={<TaskForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Form Rendering', () => {
    it('should render the form with correct initial values for new task', () => {
      renderTaskForm();
      
      // Check that the form title is correct
      expect(screen.getByText('Add New Task')).toBeDefined();
      
      // Check that form fields are rendered with initial values
      const titleInput = screen.getByLabelText(/Task Title/i) as HTMLInputElement;
      const categorySelect = screen.getByLabelText(/Category/i) as HTMLSelectElement;
      const tenantInput = screen.getByLabelText(/Tenant/i) as HTMLInputElement;
      const statusSelect = screen.getByLabelText(/Status/i) as HTMLSelectElement;
      
      expect(titleInput.value).toBe('');
      expect(categorySelect.value).toBe('Primary');
      expect(tenantInput.value).toBe('');
      expect(statusSelect.value).toBe('Planned');
      
      // Check that the submit button is rendered
      expect(screen.getByRole('button', { name: /Save Task/i })).toBeDefined();
    });

    it('should load and display existing task data when editing', async () => {
      // Setup mock for existing task
      const mockTask = {
        id: 1,
        title: 'Existing Task',
        category: 'Strategic',
        impact: 4,
        urgency: 3,
        tenant: 'Test Tenant',
        status: 'In Progress',
        weekOf: '2025-05-20',
        notes: 'Test notes'
      };
      
      // Set mock params to simulate editing an existing task
      mockParams = { id: '1' };
      
      // Mock the database get method to return the task
      vi.mocked(db.tasks.get).mockResolvedValue(mockTask);
      
      renderTaskForm();
      
      // Wait for the task to load
      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeDefined();
      });
      
      // Check that form fields are populated with task data
      await waitFor(() => {
        const titleInput = screen.getByLabelText(/Task Title/i) as HTMLInputElement;
        const categorySelect = screen.getByLabelText(/Category/i) as HTMLSelectElement;
        const tenantInput = screen.getByLabelText(/Tenant/i) as HTMLInputElement;
        const statusSelect = screen.getByLabelText(/Status/i) as HTMLSelectElement;
        
        expect(titleInput.value).toBe('Existing Task');
        expect(categorySelect.value).toBe('Strategic');
        expect(tenantInput.value).toBe('Test Tenant');
        expect(statusSelect.value).toBe('In Progress');
      });
    });
  });

  describe('Form Submission', () => {
    it('should validate required fields on submit', async () => {
      // Mock console.error to capture the error message
      const originalConsoleError = console.error;
      const mockConsoleError = vi.fn();
      console.error = mockConsoleError;
      
      renderTaskForm();
      
      // Submit the form without filling required fields
      const submitButton = screen.getByRole('button', { name: /Save Task/i });
      fireEvent.click(submitButton);
      
      // Check that the form error was logged
      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalled();
      });
      
      // Restore the original console.error
      console.error = originalConsoleError;
    });

    it('should add a new task when form is submitted with valid data', async () => {
      // Mock successful task addition
      vi.mocked(db.tasks.add).mockResolvedValue(1);
      
      renderTaskForm();
      
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Task Title/i), { target: { value: 'New Test Task' } });
      fireEvent.change(screen.getByLabelText(/Tenant/i), { target: { value: 'Test Tenant' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Save Task/i });
      fireEvent.click(submitButton);
      
      // Check that the database add method was called with correct data
      await waitFor(() => {
        expect(db.tasks.add).toHaveBeenCalledTimes(1);
        expect(db.tasks.add).toHaveBeenCalledWith(expect.objectContaining({
          title: 'New Test Task',
          tenant: 'Test Tenant'
        }));
      });
      
      // Check that navigation occurred after successful submission
      expect(mockNavigate).toHaveBeenCalledWith('/', { state: { refresh: true } });
    });

    it('should update an existing task when editing', async () => {
      // Setup mock for existing task
      const mockTask = {
        id: 1,
        title: 'Existing Task',
        category: 'Strategic',
        impact: 4,
        urgency: 3,
        tenant: 'Test Tenant',
        status: 'In Progress',
        weekOf: '2025-05-20',
        notes: 'Test notes'
      };
      
      // Set mock params to simulate editing an existing task
      mockParams = { id: '1' };
      
      // Mock the database methods
      vi.mocked(db.tasks.get).mockResolvedValue(mockTask);
      vi.mocked(db.tasks.update).mockResolvedValue(1);
      
      renderTaskForm();
      
      // Wait for the task to load
      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeDefined();
      });
      
      // Change the title
      const titleInput = await screen.findByLabelText(/Task Title/i);
      fireEvent.change(titleInput, { target: { value: 'Updated Task Title' } });
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Save Task/i });
      fireEvent.click(submitButton);
      
      // Check that the database update method was called with correct data
      await waitFor(() => {
        expect(db.tasks.update).toHaveBeenCalledTimes(1);
        expect(db.tasks.update).toHaveBeenCalledWith(1, expect.objectContaining({
          title: 'Updated Task Title'
        }));
      });
      
      // Check that navigation occurred after successful submission
      expect(mockNavigate).toHaveBeenCalledWith('/', { state: { refresh: true } });
    });
  });

  describe('User Interactions', () => {
    it('should navigate back when cancel button is clicked', () => {
      renderTaskForm();
      
      // Click the cancel button
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);
      
      // Check that navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should update form state when input values change', () => {
      renderTaskForm();
      
      // Change the title
      const titleInput = screen.getByLabelText(/Task Title/i) as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'New Title' } });
      
      // Check that the input value was updated
      expect(titleInput.value).toBe('New Title');
      
      // Change the category
      const categorySelect = screen.getByLabelText(/Category/i) as HTMLSelectElement;
      fireEvent.change(categorySelect, { target: { value: 'Strategic' } });
      
      // Check that the select value was updated
      expect(categorySelect.value).toBe('Strategic');
    });
  });
});