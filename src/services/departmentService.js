/**
 * Department API Service Layer
 *
 * Communicates with the Spring Boot backend departments API.
 * Base URL is configured via VITE_API_BASE_URL (default: http://localhost:8080/api).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Fetch all departments from Spring Boot backend.
 * Endpoint: GET /departments
 *
 * @returns {Promise<Array<{
 *   id: number,
 *   name: string,
 *   code: string,
 *   description: string,
 *   status: string,
 *   taskCount: number
 * }>>}
 */
export async function getDepartments() {
  const url = `${API_BASE_URL}/departments`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    let message = `Failed to fetch departments (Status: ${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        message = errorJson.message;
      }
    } catch {
      // Body was not JSON, retain default message
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Fetch a single department by its ID.
 * Endpoint: GET /departments/:id
 *
 * @param {number|string} id
 */
export async function getDepartmentById(id) {
  const url = `${API_BASE_URL}/departments/${id}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    let message = `Failed to fetch department #${id} (Status: ${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        message = errorJson.message;
      }
    } catch {
      // Body was not JSON
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const departmentService = {
  getAll: getDepartments,
  getById: getDepartmentById
};

export default departmentService;
