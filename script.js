/* global */ 'use strict';

// ── Storage key ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'todo-items';

// ── State ────────────────────────────────────────────────────────────────────
let todos = [];
let currentFilter = 'all';
let editingId = null;

// ── DOM refs ─────────────────────────────────────────────────────────────────
const todoForm          = document.getElementById('todo-form');
const todoInput         = document.getElementById('todo-input');
const errorMsg          = document.getElementById('error-msg');
const todoList          = document.getElementById('todo-list');
const filterBtns        = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const statTotal         = document.getElementById('stat-total');
const statRemaining     = document.getElementById('stat-remaining');
const statCompleted     = document.getElementById('stat-completed');

// Edit modal
const editModal    = document.getElementById('edit-modal');
const modalOverlay = document.getElementById('modal-overlay');
const editForm     = document.getElementById('edit-form');
const editInput    = document.getElementById('edit-input');
const editErrorMsg = document.getElementById('edit-error-msg');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// ── Persistence helpers ───────────────────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch {
    todos = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ── Unique ID ─────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Render ────────────────────────────────────────────────────────────────────
function getFilteredTodos() {
  switch (currentFilter) {
    case 'active':    return todos.filter(t => !t.completed);
    case 'completed': return todos.filter(t =>  t.completed);
    default:          return todos;
  }
}

function renderTodos() {
  const filtered = getFilteredTodos();
  todoList.innerHTML = '';

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item${todo.completed ? ' completed' : ''}`;
    li.dataset.id = todo.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => toggleComplete(todo.id));

    // Text
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    // Actions
    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.setAttribute('aria-label', `Edit "${todo.text}"`);
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', () => openEditModal(todo.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.setAttribute('aria-label', `Delete "${todo.text}"`);
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    actions.append(editBtn, deleteBtn);
    li.append(checkbox, span, actions);
    todoList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const total     = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const remaining = total - completed;

  statTotal.textContent     = `${total} total`;
  statRemaining.textContent = `${remaining} remaining`;
  statCompleted.textContent = `${completed} completed`;
}

// ── Actions ───────────────────────────────────────────────────────────────────
function addTodo(text) {
  todos.push({ id: generateId(), text, completed: false });
  save();
  renderTodos();
}

function toggleComplete(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    save();
    renderTodos();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  renderTodos();
}

function updateTodo(id, newText) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.text = newText;
    save();
    renderTodos();
  }
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  renderTodos();
}

// ── Edit modal helpers ────────────────────────────────────────────────────────
function openEditModal(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  editingId = id;
  editInput.value = todo.text;
  editErrorMsg.textContent = '';
  editModal.hidden = false;
  modalOverlay.hidden = false;
  editInput.focus();
  editInput.select();
}

function closeEditModal() {
  editingId = null;
  editModal.hidden = true;
  modalOverlay.hidden = true;
  editErrorMsg.textContent = '';
}

// ── Event listeners ───────────────────────────────────────────────────────────

// Add todo
todoForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) {
    errorMsg.textContent = 'Please enter a task before adding.';
    todoInput.focus();
    return;
  }
  errorMsg.textContent = '';
  addTodo(text);
  todoInput.value = '';
  todoInput.focus();
});

// Clear error on input
todoInput.addEventListener('input', () => {
  if (todoInput.value.trim()) errorMsg.textContent = '';
});

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// Clear completed
clearCompletedBtn.addEventListener('click', clearCompleted);

// Save edit
editForm.addEventListener('submit', e => {
  e.preventDefault();
  const newText = editInput.value.trim();
  if (!newText) {
    editErrorMsg.textContent = 'Task cannot be empty.';
    editInput.focus();
    return;
  }
  updateTodo(editingId, newText);
  closeEditModal();
});

// Cancel edit
cancelEditBtn.addEventListener('click', closeEditModal);

// Close modal on overlay click
modalOverlay.addEventListener('click', closeEditModal);

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !editModal.hidden) closeEditModal();
});

// ── Init ──────────────────────────────────────────────────────────────────────
load();
renderTodos();
