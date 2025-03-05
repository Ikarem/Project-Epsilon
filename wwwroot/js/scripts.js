class TagManager {
    constructor() {
        this.tags = [];
        this.loadTags();
    }

    async loadTags() {
        try {

            this.tags = await getAllTags();
        } catch (error) {
            console.error('Error loading tags:', error);

            this.tags = ['bug', 'feature', 'documentation', 'enhancement', 'urgent'];
        }
    }

    async addTag(tag) {
        try {

            await addTag(tag);
            this.tags.push(tag);
        } catch (error) {
            console.error('Error adding tag:', error);
        }
    }

    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index > -1) {
            this.tags.splice(index, 1);
            this.saveTags();
        }
    }

    getTags() {
        return [...this.tags];
    }
}

const tagManager = new TagManager();

function showAddTagForm() {

    const newTag = prompt('Enter new tag name:');

    if (newTag && newTag.trim() !== '') {
        tagManager.addTag(newTag.trim());

        const tagSelect = document.getElementById('taskTagsSelect');
        if (tagSelect) {
            const option = document.createElement('option');
            option.value = newTag.trim();
            option.textContent = newTag.trim();
            tagSelect.appendChild(option);
        }
    }
}

async function loadDashboard() {
    try {
        const projects = await fetchProjects();
        renderProjects(projects);
    } catch (error) {
        console.error(error);
        alert('Failed to load projects. Please try again.');
    }
}

function renderProjects(projects) {
    const projectList = document.getElementById('projectList');
    projectList.innerHTML = '';

    projects.forEach(project => {
        const li = document.createElement('li');
        li.className = 'project-item';
        li.dataset.projectId = project.id;
        li.style.borderLeftColor = project.color;


        const tasks = project.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const projectProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        li.innerHTML = `
            <div class="project-item-header">
                <strong>${project.name}</strong>
                <span class="progress-badge">${projectProgress}%</span>
            </div>
            <div class="project-item-body">
                <p>${project.description || 'No description'}</p>
                <small>Tasks: ${tasks.length} | Created: ${new Date(project.createdAt).toLocaleDateString()}</small>
                <div class="project-buttons">
                    <button class="view-btn" onclick="viewProject(${project.id})">View</button>
                    <button class="delete-btn" onclick="deleteProject(${project.id})">Delete</button>
                </div>
            </div>
        `;
        projectList.appendChild(li);
    });
}

function createOverlay() {
    const existingOverlay = document.getElementById('form-overlay');
    if (existingOverlay) {
        document.body.removeChild(existingOverlay);
    }

    const overlay = document.createElement('div');
    overlay.id = 'form-overlay';
    overlay.className = 'form-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9000';
    overlay.style.display = 'block';

    document.body.appendChild(overlay);

    const formIds = ['taskForm', 'projectForm', 'riskForm', 'milestoneForm'];
    formIds.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.style.zIndex = '10000';
            form.style.position = 'fixed';
        }
    });

    overlay.addEventListener('click', function () {
        hideAllForms();
        document.body.removeChild(overlay);
    });
}

function hideOverlay() {
    const overlay = document.querySelector('.form-overlay');
    if (overlay) {
        overlay.classList.add('closing');
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.classList.remove('closing');
        }, 200);
    }
}

function closeFormWithAnimation(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.classList.add('closing');
        setTimeout(() => {
            form.style.display = 'none';
            form.classList.remove('closing');
        }, 200);
    }
}

function showAddProjectForm() {
    createOverlay();
    document.getElementById('projectForm').style.display = 'block';
    document.getElementById('dashboardView').style.display = 'none';
}

function showAddTaskForm() {
    createOverlay();

    const taskForm = document.getElementById('taskForm');
    if (taskForm) {

        document.getElementById('taskNameInput').value = '';
        document.getElementById('taskDescriptionInput').value = '';
        document.getElementById('taskPriorityInput').value = 'medium';
        document.getElementById('taskDueDateInput').value = '';
        document.getElementById('taskAssigneeInput').value = '';

        taskForm.style.zIndex = '10000';
        taskForm.style.position = 'fixed';
        taskForm.style.display = 'block';

        taskForm.style.top = '50%';
        taskForm.style.left = '50%';
        taskForm.style.transform = 'translate(-50%, -50%)';
    }
}

async function addProject(name, description, color) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            description,
            color
        })
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Failed to add project: ${errorDetails || response.statusText}`);
    }

    return await response.json();
}

async function deleteProject(id) {
    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete project');

        loadDashboard();
    } catch (error) {
        console.error(error);
        alert('Failed to delete project. Please try again.');
    }
}

function closeTaskForm() {
    hideOverlay();
    closeFormWithAnimation('taskForm');
    document.getElementById('taskNameInput').value = '';
    document.getElementById('taskPriorityInput').value = 'low';
    document.getElementById('taskDueDateInput').value = '';
}

async function submitTask(projectId) {

    if (currentUserRole === 'member') {
        alert('You do not have permission to add tasks');
        return;
    }

    const taskName = document.getElementById('taskNameInput').value.trim();
    const taskDescription = document.getElementById('taskDescriptionInput').value.trim();
    const taskPriority = document.getElementById('taskPriorityInput').value;
    const taskDueDate = document.getElementById('taskDueDateInput').value;
    const taskAssignee = document.getElementById('taskAssigneeInput').value.trim();

    const tagSelect = document.getElementById('taskTagsSelect');
    const selectedTags = Array.from(tagSelect.selectedOptions).map(option => option.value);

    if (!taskName || !taskDueDate) {
        alert('Task name and due date are required.');
        return;
    }

    try {
        await addTask(
            projectId,
            taskName,
            taskDescription,
            taskPriority,
            taskDueDate,
            taskAssignee,
            selectedTags
        );

        closeTaskForm();
        await viewProject(projectId);
        updateProjectProgress(projectId);
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task: ' + error.message);
    }
}

async function submitProject() {

    if (currentUserRole !== 'leader') {
        alert('Only leaders can create projects');
        return;
    }

    const name = document.getElementById('projectNameInput').value.trim();
    const description = document.getElementById('projectDescriptionInput').value.trim();
    const color = document.getElementById('projectColorInput').value;

    if (!name) {
        alert('Project name is required.');
        return;
    }

    try {
        const updatedProjects = await addProject(name, description, color);
        renderProjects(updatedProjects);
        cancelForm();
    } catch (error) {
        console.error(error);
        alert('Failed to add project. Please try again.');
    }
}

function cancelForm() {
    hideOverlay();
    closeFormWithAnimation('projectForm');
    document.getElementById('projectNameInput').value = '';
    document.getElementById('projectDescriptionInput').value = '';
    document.getElementById('projectColorInput').value = '#4361ee';
    document.getElementById('dashboardView').style.display = 'block';
}

let currentProjectId = null;


function setProjectProgress(projectId, percentage) {
    console.log(`Setting progress for project ${projectId} to ${percentage}%`);


    const projectListItem = document.querySelector(`.project-item[data-project-id="${projectId}"]`);
    if (projectListItem) {
        const progressBadge = projectListItem.querySelector('.progress-badge');
        if (progressBadge) {
            progressBadge.textContent = `${percentage}%`;
        }

        const progressFill = projectListItem.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
            progressFill.style.backgroundColor = getProgressColor(percentage);
        }
    }


    if (currentProjectId === projectId) {
        const completionPercentage = document.getElementById('completionPercentage');
        if (completionPercentage) {
            completionPercentage.textContent = `${percentage}%`;
        }

        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
            progressFill.style.backgroundColor = getProgressColor(percentage);
        }


        const headerProgressText = document.querySelector('.project-header-progress .progress-text');
        if (headerProgressText) {
            headerProgressText.textContent = `${percentage}%`;
        }

        const headerProgressFill = document.querySelector('.project-header-progress .progress-bar-fill');
        if (headerProgressFill) {
            headerProgressFill.style.width = `${percentage}%`;
            headerProgressFill.style.backgroundColor = getProgressColor(percentage);
        }
    }


    const progressTexts = document.querySelectorAll(`.project-progress-text[data-project-id="${projectId}"]`);
    progressTexts.forEach(element => {
        element.textContent = `${percentage}%`;
    });

    const progressBars = document.querySelectorAll(`.project-progress-bar[data-project-id="${projectId}"] .progress-fill`);
    progressBars.forEach(element => {
        element.style.width = `${percentage}%`;
        element.style.backgroundColor = getProgressColor(percentage);
    });
}

function getProgressColor(percentage) {
    if (percentage < 25) return '#f72585';
    if (percentage < 50) return '#ffc107';
    if (percentage < 75) return '#4361ee';
    return '#28a745';
}


async function handleStatusChange(projectId, taskId, newStatus) {
    try {
        await updateTaskStatus(projectId, taskId, newStatus);

        updateProjectProgress(projectId);
        await viewProject(projectId);
    } catch (error) {
        console.error('Error updating task status:', error);
        alert('Failed to update task status. Please try again.');
    }
}

function renderTasks(tasks = []) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">No tasks yet. Start by adding your first task!</div>';
        return;
    }

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item priority-${task.priority}`;
        taskElement.dataset.taskId = task.id;

        const description = task.description && task.description.trim() !== '' ?
            task.description :
            'No description';

        const assignedTo = task.assignedTo && task.assignedTo.trim() !== '' ?
            task.assignedTo :
            'Unassigned';


        const dueDate = new Date(task.dueDate);
        const isOverdue = task.status !== 'completed' && dueDate < new Date();
        const dueDateClass = isOverdue ? 'overdue' : '';


        const formattedDueDate = dueDate.toLocaleDateString();

        taskElement.innerHTML = `
            <div class="task-header">
                <h4>${task.name}</h4>
                <div class="task-meta-top">
                    <div class="priority-badge ${task.priority}">${task.priority}</div>
                    <span class="due-date ${dueDateClass}" data-date="${task.dueDate}">
                        <i class="task-icon">📅</i> ${formattedDueDate}
                    </span>
                    <span class="assigned-to">
                        <i class="task-icon">👤</i> ${assignedTo}
                    </span>
                    <!-- Status indicator for list view -->
                    <span class="status-indicator ${task.status}">
                        ${task.status}
                    </span>
                </div>
            </div>

            <div class="task-description">
                ${description}
            </div>

            <div class="task-tags">
                ${renderTags(task.tags)}
            </div>

            <div class="task-actions">
                <select class="status-dropdown" 
                        onchange="handleStatusChange(${task.projectId}, ${task.id}, this.value)">
                    <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>

                <div class="action-buttons">
                    <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
                </div>
            </div>
        `;
        taskList.appendChild(taskElement);
    });


    if (taskViewMode === 'list') {
        taskList.classList.add('list-view');
    } else {
        taskList.classList.remove('list-view');
    }
}

function renderTags(tags) {

    if (!tags) return '';
    if (!Array.isArray(tags)) return '';

    return tags.map(tag => {

        const tagStr = typeof tag === 'object' ?
            (tag.hasOwnProperty('name') ? tag.name : tag.toString()) :
            String(tag);

        return `<span class="task-tag">${tagStr}</span>`;
    }).join('');
}

function updateTimeline(tasks) {
    const timeline = document.getElementById('projectTimeline');
    if (!timeline) return;

    timeline.innerHTML = '';

    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    sortedTasks.forEach(task => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-date">
                ${new Date(task.dueDate).toLocaleDateString()}
            </div>
            <div class="timeline-content">
                <strong>${task.name}</strong>
                <div class="status ${task.status}">${task.status}</div>
            </div>
        `;
        timeline.appendChild(timelineItem);
    });
}

async function renderTeamWorkload(projectId) {
    try {

        const workloadData = await getWorkloadDistribution(projectId);
        const workloadContainer = document.getElementById('teamWorkload');

        if (!workloadContainer) return;
        workloadContainer.innerHTML = '';

        if (Object.keys(workloadData).length === 0) {
            workloadContainer.innerHTML = '<div class="empty-state">No workload data available</div>';
            return;
        }


        Object.entries(workloadData).forEach(([assignee, stats]) => {
            const workloadCard = document.createElement('div');
            workloadCard.className = 'workload-card';

            const completionPercentage = stats.total > 0 ?
                Math.round((stats.completed / stats.total) * 100) :
                0;

            workloadCard.innerHTML = `
                <div class="workload-header">
                    <h4>${assignee}</h4>
                    <span class="workload-badge">${stats.total} tasks</span>
                </div>
                <div class="workload-stats">
                    <div class="workload-stat">
                        <span class="stat-label">Pending</span>
                        <span class="stat-value">${stats.pending}</span>
                    </div>
                    <div class="workload-stat">
                        <span class="stat-label">In Progress</span>
                        <span class="stat-value">${stats.inProgress}</span>
                    </div>
                    <div class="workload-stat">
                        <span class="stat-label">Completed</span>
                        <span class="stat-value">${stats.completed}</span>
                    </div>
                </div>
                <div class="workload-progress">
                    <div class="workload-progress-bar">
                        <div class="workload-progress-fill" style="width: ${completionPercentage}%"></div>
                    </div>
                    <span>${completionPercentage}% complete</span>
                </div>
            `;

            workloadContainer.appendChild(workloadCard);
        });
    } catch (error) {
        console.error('Error rendering team workload:', error);
        const workloadContainer = document.getElementById('teamWorkload');
        if (workloadContainer) {
            workloadContainer.innerHTML = '<div class="empty-state">Failed to load workload data</div>';
        }
    }
}

async function editTask(taskId) {
    try {
        const task = document.querySelector(`[data-task-id="${taskId}"]`);
        if (!task) return;

        const dateElement = task.querySelector('.due-date');
        const dateParts = dateElement.dataset.date.split('T')[0];

        document.getElementById('taskForm').style.display = 'block';
        document.getElementById('taskNameInput').value = task.querySelector('h4').textContent;
        document.getElementById('taskDescriptionInput').value = task.querySelector('.task-description').textContent.trim() === 'No description' ? '' : task.querySelector('.task-description').textContent.trim();
        document.getElementById('taskPriorityInput').value = task.className.match(/priority-(\w+)/)[1];
        document.getElementById('taskDueDateInput').value = dateParts;

        const assigneeText = task.querySelector('.assigned-to').textContent.trim();
        const assignee = assigneeText.replace('👤', '').trim();
        document.getElementById('taskAssigneeInput').value = assignee !== 'Any' ? assignee : '';

        const submitButton = document.querySelector('#taskForm button:first-child');
        submitButton.textContent = 'Update Task';
        submitButton.onclick = () => updateTask(currentProjectId, taskId);
    } catch (error) {
        console.error('Error editing task:', error);
    }
}

async function deleteTask(taskId) {
    try {
        await fetch(`/api/projects/${currentProjectId}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        updateProjectProgress(currentProjectId);
        await viewProject(currentProjectId);
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
    }
}

async function updateTask(projectId, taskId) {
    try {
        const taskData = {
            name: document.getElementById('taskNameInput').value.trim(),
            description: document.getElementById('taskDescriptionInput').value.trim(),
            priority: document.getElementById('taskPriorityInput').value,
            dueDate: document.getElementById('taskDueDateInput').value,
            assignedTo: document.getElementById('taskAssigneeInput').value.trim(),
            projectId: projectId,
            id: taskId
        };

        const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        closeTaskForm();
        await viewProject(projectId);
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Failed to update task: ' + error.message);
    }
}

function addTagToTask(taskId, tag) {
    const task = document.querySelector(`[data-task-id="${taskId}"]`);
    if (!task) return;

    const tagsContainer = task.querySelector('.task-tags');
    if (!tagsContainer) {
        const metaContainer = task.querySelector('.task-meta');
        const tagsDiv = document.createElement('div');
        tagsDiv.className = 'task-tags';
        metaContainer.after(tagsDiv);
    }

    const tagElement = document.createElement('span');
    tagElement.className = 'task-tag';
    tagElement.textContent = tag;
    task.querySelector('.task-tags').appendChild(tagElement);
}

class Milestone {
    constructor(name, dueDate, description = '') {
        this.id = Date.now();
        this.name = name;
        this.dueDate = dueDate;
        this.description = description;
        this.completed = false;
    }

    complete() {
        this.completed = true;
        this.completedAt = new Date();
    }
}





function loadMilestones(milestones) {
    const milestonesContainer = document.getElementById('projectMilestones');
    if (!milestonesContainer)
        return;

    milestonesContainer.innerHTML = '';

    if (!milestones || milestones.length === 0) {
        milestonesContainer.innerHTML = '<p class="empty-message">No milestones added yet.</p>';
        return;
    }

    const sortedMilestones = [...milestones].sort((a, b) =>
        new Date(a.dueDate) - new Date(b.dueDate)
    );

    sortedMilestones.forEach(milestone => {
        const milestoneEl = document.createElement('div');
        milestoneEl.className = 'milestone-item';
        milestoneEl.dataset.milestoneId = milestone.id;

        const today = new Date();
        const dueDate = new Date(milestone.dueDate);
        const daysRemaining = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

        let statusClass = '';
        if (daysRemaining < 0) statusClass = 'overdue';
        else if (daysRemaining <= 7) statusClass = 'soon';
        else statusClass = 'on-track';

        milestoneEl.innerHTML = `
            <div class="milestone-header">
                <h4>${milestone.name}</h4>
                <div class="milestone-date ${statusClass}">
                    ${new Date(milestone.dueDate).toLocaleDateString()}
                </div>
            </div>
            <p>${milestone.description || 'No description'}</p>
            <div class="milestone-footer">
                <div class="milestone-status ${statusClass}">
                    ${daysRemaining < 0
                    ? `Overdue by ${Math.abs(daysRemaining)} days`
                    : daysRemaining === 0
                        ? 'Due today'
                        : `${daysRemaining} days remaining`}
                </div>
                <div class="action-buttons">
                    <button class="delete-btn" onclick="deleteMilestone(${milestone.id})">Delete</button>
                </div>
            </div>
        `;

        milestonesContainer.appendChild(milestoneEl);
    });
}

async function deleteRisk(riskId) {
    try {
        if (!riskId) {
            console.error('Invalid risk ID');
            alert('Cannot delete: Invalid risk ID');
            return;
        }


        const response = await fetch(`/api/projects/${currentProjectId}/risks/${riskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {

            const fallbackResponse = await fetch(`/api/risks/${riskId}`, {
                method: 'DELETE'
            });

            if (!fallbackResponse.ok) {
                throw new Error(`Failed to delete risk: Server responded with ${response.status}`);
            }
        }

        console.log(`Successfully deleted risk ${riskId}`);


        await viewProject(currentProjectId);
    } catch (error) {
        console.error('Error deleting risk:', error);
        alert('Failed to delete risk');
    }
}

async function deleteMilestone(milestoneId) {
    try {
        if (!milestoneId) {
            console.error('Invalid milestone ID');
            alert('Cannot delete: Invalid milestone ID');
            return;
        }


        const response = await fetch(`/api/projects/${currentProjectId}/milestones/${milestoneId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {

            const fallbackResponse = await fetch(`/api/milestones/${milestoneId}`, {
                method: 'DELETE'
            });

            if (!fallbackResponse.ok) {
                throw new Error(`Failed to delete milestone: Server responded with ${response.status}`);
            }
        }

        console.log(`Successfully deleted milestone ${milestoneId}`);


        await viewProject(currentProjectId);
    } catch (error) {
        console.error('Error deleting milestone:', error);
        alert('Failed to delete milestone');
    }
}

function showAddRiskForm() {
    createOverlay();
    document.getElementById('riskForm').style.display = 'block';

    document.getElementById('riskDescriptionInput').value = '';
    document.getElementById('riskImpactInput').value = 'Low';
    document.getElementById('riskProbabilityInput').value = 'Low';
    document.getElementById('riskMitigationInput').value = '';

    const submitButton = document.querySelector('#riskForm .form-buttons button:first-child');
    submitButton.onclick = () => submitRisk(currentProjectId);
}

function closeRiskForm() {
    hideOverlay();
    closeFormWithAnimation('riskForm');
}

function showAddMilestoneForm() {
    createOverlay();
    document.getElementById('milestoneForm').style.display = 'block';

    document.getElementById('milestoneNameInput').value = '';
    document.getElementById('milestoneDescriptionInput').value = '';
    document.getElementById('milestoneDueDateInput').value = '';

    const submitButton = document.querySelector('#milestoneForm .form-buttons button:first-child');
    submitButton.onclick = () => submitMilestone(currentProjectId);
}

function closeMilestoneForm() {
    hideOverlay();
    closeFormWithAnimation('milestoneForm');
}

async function submitRisk(projectId) {
    const description = document.getElementById('riskDescriptionInput').value.trim();
    const impact = document.getElementById('riskImpactInput').value;
    const probability = document.getElementById('riskProbabilityInput').value;
    const mitigation = document.getElementById('riskMitigationInput').value.trim();

    if (!description) {
        alert('Risk description is required.');
        return;
    }

    try {

        const formattedImpact = String(impact).charAt(0).toUpperCase() + String(impact).slice(1).toLowerCase();
        const formattedProbability = String(probability).charAt(0).toUpperCase() + String(probability).slice(1).toLowerCase();

        await addRisk(projectId, description, formattedImpact, formattedProbability, mitigation);
        closeRiskForm();

        const project = await getProject(projectId);
        renderRisks(project.risks || []);
    } catch (error) {
        console.error('Error adding risk:', error);
        alert('Failed to add risk: ' + error.message);
    }
}

async function submitMilestone(projectId) {

    if (currentUserRole === 'member') {
        alert('You do not have permission to add milestones');
        return;
    }

    const name = document.getElementById('milestoneNameInput').value.trim();
    const description = document.getElementById('milestoneDescriptionInput').value.trim();
    const dueDate = document.getElementById('milestoneDueDateInput').value;

    if (!name || !dueDate) {
        alert('Milestone name and due date are required.');
        return;
    }

    try {

        await addMilestone(projectId, name, description, dueDate);
        closeMilestoneForm();

        const milestones = await getMilestones(projectId);
        loadMilestones(milestones);
    } catch (error) {
        console.error('Error adding milestone:', error);
        alert('Failed to add milestone: ' + error.message);
    }
}

function renderRisks(risks = []) {
    const riskList = document.getElementById('riskList');
    riskList.innerHTML = '';

    if (risks.length === 0) {
        riskList.innerHTML = '<div class="empty-state">No risks identified yet</div>';
        return;
    }

    risks.forEach(risk => {
        const riskElement = document.createElement('div');
        riskElement.className = 'risk-item';
        riskElement.dataset.riskId = risk.id;


        const impactStr = String(risk.impact || '').trim();
        const probabilityStr = String(risk.probability || '').trim();

        console.log("Risk data:", {
            id: risk.id,
            impact: impactStr,
            probability: probabilityStr
        });


        const riskScore = risk.calculateRiskScore ||
            (impactStr.toLowerCase() === 'high' ? 3 :
                impactStr.toLowerCase() === 'medium' ? 2 : 1) *
            (probabilityStr.toLowerCase() === 'high' ? 3 :
                probabilityStr.toLowerCase() === 'medium' ? 2 : 1);


        const impactColors = {
            'high': '#ff4444',
            'medium': '#ffbb33',
            'low': '#00C851'
        };

        const probabilityColors = {
            'high': '#ff4444',
            'medium': '#ffbb33',
            'low': '#00C851'
        };

        const scoreToColor = {
            9: '#ff4444',
            6: '#ff9800',
            4: '#ffbb33',
            3: '#ffeb3b',
            2: '#c0ca33',
            1: '#00C851'
        };

        const impactColor = impactColors[impactStr.toLowerCase()] || '#ff4444';
        const probabilityColor = probabilityColors[probabilityStr.toLowerCase()] || '#ffbb33';
        const scoreColor = scoreToColor[riskScore] || '#ff4444';
        const mitigation = risk.mitigationStrategy || 'No mitigation strategy provided';

        riskElement.innerHTML = `
            <div class="risk-header">
                <h4>${risk.description}</h4>
                <div class="risk-badges">
                    <span class="risk-badge" style="background-color: ${impactColor}">Impact: ${impactStr}</span>
                    <span class="risk-badge" style="background-color: ${probabilityColor}">Prob: ${probabilityStr}</span>
                    <div class="risk-score-circle" style="background-color: ${scoreColor}" title="Risk Score: ${riskScore}"></div>
                </div>
            </div>
            <div class="risk-mitigation">
                <strong>Mitigation:</strong> ${mitigation}
            </div>
            <div class="risk-footer">
                <div class="action-buttons member-only">
                    <button class="delete-btn" onclick="deleteRisk(${risk.id})">Delete</button>
                </div>
            </div>
        `;

        riskList.appendChild(riskElement);
    });
}

function calculateRiskScore(impact, probability) {
    const impactScore = String(impact).toLowerCase() === 'high' ? 3 :
        String(impact).toLowerCase() === 'medium' ? 2 : 1;
    const probScore = String(probability).toLowerCase() === 'high' ? 3 :
        String(probability).toLowerCase() === 'medium' ? 2 : 1;
    return impactScore * probScore;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function updateCharts(tasks, project) {
    try {

        if (typeof updateProjectChart === 'function') {
            updateProjectChart(tasks);
        }

        if (typeof createPriorityChart === 'function') {
            createPriorityChart(tasks, project.id);
        }

        if (typeof createBurndownChart === 'function') {
            const projectStartDate = project.createdAt ?
                new Date(project.createdAt) :
                new Date();

            const projectEndDate = tasks.length > 0 ?
                new Date(Math.max(...tasks.map(t => new Date(t.dueDate)))) :
                new Date(projectStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);

            createBurndownChart(tasks, projectStartDate, projectEndDate);
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

async function updateProjectProgress(projectId) {
    try {

        const response = await fetch(`${API_BASE_URL}/projects/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project data');
        const project = await response.json();

        const tasks = project.tasks || [];
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const progressPercentage = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

        console.log(`Updating progress for project ${projectId}: ${progressPercentage}%`);


        setProjectProgress(projectId, progressPercentage);


        const projectListItem = document.querySelector(`.project-item[data-project-id="${projectId}"]`);
        if (projectListItem) {
            const progressText = projectListItem.querySelector('.progress-badge');
            if (progressText) {
                progressText.textContent = `${progressPercentage}%`;
            }

            const progressFill = projectListItem.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progressPercentage}%`;
                progressFill.style.backgroundColor = getProgressColor(progressPercentage);
            }
        }
    } catch (error) {
        console.error('Error updating project progress:', error);
    }
}


function updateThemeIcons() {
    const isDark = document.body.classList.contains('dark-mode');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (sunIcon && moonIcon) {
        if (isDark) {
            sunIcon.style.opacity = '0';
            sunIcon.style.transform = 'rotate(30deg) scale(0.7)';
            moonIcon.style.opacity = '1';
            moonIcon.style.transform = 'rotate(0) scale(1)';
        } else {
            sunIcon.style.opacity = '1';
            sunIcon.style.transform = 'rotate(0) scale(1)';
            moonIcon.style.opacity = '0';
            moonIcon.style.transform = 'rotate(-30deg) scale(0.7)';
        }
    }
}

let currentUserRole = 'leader';

function changeUserRole(role, saveToStorage = true) {
    console.log('Changing role to:', role);

    currentUserRole = role;

    if (typeof updateUIBasedOnRole === 'function') {
        updateUIBasedOnRole();
    }

    if (saveToStorage) {
        localStorage.setItem('epsilon-role', role);
    }

    const roleDisplay = {
        'leader': 'Leader',
        'manager': 'Manager',
        'member': 'Member'
    };

    const userRoleDisplay = document.getElementById('userRoleDisplay');
    if (userRoleDisplay) {
        userRoleDisplay.textContent = `Welcome, ${roleDisplay[role]}`;
    }

    const dropdownContent = document.getElementById('roleDropdownContent');
    if (dropdownContent) {
        dropdownContent.style.display = 'none';
    }
}

function updateUIBasedOnRole() {

    const leaderOnlyElements = document.querySelectorAll('.leader-only');
    const managerOnlyElements = document.querySelectorAll('.manager-only');
    const memberOnlyElements = document.querySelectorAll('.member-only');

    [...leaderOnlyElements, ...managerOnlyElements, ...memberOnlyElements].forEach(el => {
        el.classList.add('role-restricted');
    });

    if (currentUserRole === 'leader') {
        leaderOnlyElements.forEach(el => el.classList.remove('role-restricted'));
        managerOnlyElements.forEach(el => el.classList.remove('role-restricted'));
        memberOnlyElements.forEach(el => el.classList.remove('role-restricted'));
    } else if (currentUserRole === 'manager') {
        managerOnlyElements.forEach(el => el.classList.remove('role-restricted'));
        memberOnlyElements.forEach(el => el.classList.remove('role-restricted'));
    } else if (currentUserRole === 'member') {
        memberOnlyElements.forEach(el => el.classList.remove('role-restricted'));
    }
}

function updateRoleDisplay(role) {
    const roleDisplay = {
        'leader': 'Leader',
        'manager': 'Manager',
        'member': 'Member'
    };

    const userRoleDisplay = document.getElementById('userRoleDisplay');
    if (userRoleDisplay) {
        userRoleDisplay.textContent = `Welcome, ${roleDisplay[role]}`;
    }
}

function setupRoleDropdown() {
    console.log('Setting up role dropdown');

    const roleDropdown = document.querySelector('.role-dropdown');
    console.log('Role dropdown found:', roleDropdown);

    if (!roleDropdown) {
        console.error('Role dropdown element not found');
        return;
    }

    const roleDisplay = document.getElementById('userRoleDisplay');
    if (roleDisplay) {
        console.log('Found role display element');
        roleDisplay.addEventListener('click', function (e) {
            console.log('Role display clicked');
            const dropdownContent = document.querySelector('.role-dropdown-content');
            if (dropdownContent) {
                console.log('Toggling dropdown');

                const rect = roleDropdown.getBoundingClientRect();

                dropdownContent.style.position = 'fixed';
                dropdownContent.style.top = (rect.bottom + 10) + 'px';
                dropdownContent.style.left = rect.left + 'px';
                dropdownContent.style.right = 'auto';
                dropdownContent.style.zIndex = '9999';

                dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
                e.stopPropagation();
            } else {
                console.error('Dropdown content not found');
            }
        });
    }

    document.addEventListener('click', function () {
        const dropdownContent = document.querySelector('.role-dropdown-content');
        if (dropdownContent) {
            dropdownContent.style.display = 'none';
        }
    });

    const dropdownContent = document.querySelector('.role-dropdown-content');
    if (dropdownContent) {
        dropdownContent.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }
}

document.addEventListener('click', function (event) {
    const dropdown = document.querySelector('.role-dropdown');
    const dropdownContent = document.getElementById('roleDropdownContent');

    if (dropdown && dropdownContent && !dropdown.contains(event.target)) {
        dropdownContent.style.display = 'none';
    }
});

function toggleRoleDropdown(event) {
    const dropdownContent = document.getElementById('roleDropdownContent');

    if (!dropdownContent) {
        console.error('Dropdown content element not found');
        return;
    }

    console.log('Toggle dropdown called');

    const roleDropdown = document.getElementById('roleDropdown');
    if (roleDropdown) {
        const rect = roleDropdown.getBoundingClientRect();

        dropdownContent.style.position = 'fixed';
        dropdownContent.style.top = (rect.bottom + 5) + 'px';
        dropdownContent.style.right = (window.innerWidth - rect.right) + 'px';
        dropdownContent.style.zIndex = '9999';

        if (dropdownContent.style.display === 'block') {
            console.log('Hiding dropdown');
            dropdownContent.style.display = 'none';
        } else {
            console.log('Showing dropdown');
            dropdownContent.style.display = 'block';

            dropdownContent.style.backgroundColor = 'white';
            dropdownContent.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            dropdownContent.style.borderRadius = '4px';
        }
    }

    if (event) {
        event.stopPropagation();
    }
}

document.addEventListener('click', function (event) {
    const roleDropdown = document.getElementById('roleDropdown');
    const dropdownContent = document.getElementById('roleDropdownContent');

    if (roleDropdown && dropdownContent && !roleDropdown.contains(event.target)) {
        dropdownContent.style.display = 'none';
    }
});

function initializeRoleDropdown() {
    console.log('Initializing role dropdown');

    const roleDropdown = document.getElementById('roleDropdown');
    const roleDisplay = document.getElementById('userRoleDisplay');

    console.log('Role dropdown element:', roleDropdown);
    console.log('Role display element:', roleDisplay);

    if (roleDropdown) {

        roleDropdown.addEventListener('click', function (event) {
            toggleRoleDropdown(event);
        });

        console.log('Added click event to role dropdown');
    }

    const savedRole = localStorage.getItem('epsilon-role') || 'leader';
    changeUserRole(savedRole, false);

    console.log('Role dropdown initialization complete');
}




async function loadStatistics() {
    try {
        console.log('Loading statistics...');


        const completionRateChart = document.getElementById('completionRateChart');
        const taskVelocityChart = document.getElementById('taskVelocityChart');
        const completionTimeChart = document.getElementById('completionTimeChart');
        const projectHealthGrid = document.getElementById('projectHealthGrid');


        if (completionRateChart) completionRateChart.innerHTML = '<div class="loading-indicator">Loading completion data...</div>';
        if (taskVelocityChart) taskVelocityChart.innerHTML = '<div class="loading-indicator">Loading velocity data...</div>';
        if (completionTimeChart) completionTimeChart.innerHTML = '<div class="loading-indicator">Loading completion time data...</div>';
        if (projectHealthGrid) projectHealthGrid.innerHTML = '<div class="loading-indicator">Loading project health data...</div>';


        let projects = [];
        try {
            projects = await fetchProjects();
            console.log('Fetched projects for statistics:', projects);


            const projectDetails = await Promise.all(
                projects.map(async project => {
                    try {
                        return await getProject(project.id);
                    } catch (error) {
                        console.warn(`Error fetching details for project ${project.id}:`, error);
                        return project;
                    }
                })
            );

            projects = projectDetails;
            console.log('Fetched project details for statistics:', projectDetails);
        } catch (error) {
            console.error('Error fetching projects for statistics:', error);

        }


        try {
            if (completionRateChart) {
                calculateCompletionRate(projects);
            }
        } catch (error) {
            console.error('Error calculating completion rate:', error);
            if (completionRateChart) {
                completionRateChart.innerHTML = '<div class="error-message">Failed to load completion rate chart</div>';
            }
        }


        try {
            if (taskVelocityChart) {
                calculateTaskVelocity(projects);
            }
        } catch (error) {
            console.error('Error calculating task velocity:', error);
            if (taskVelocityChart) {
                taskVelocityChart.innerHTML = '<div class="error-message">Failed to load task velocity chart</div>';
            }
        }


        try {
            if (completionTimeChart) {
                calculateCompletionTimeDistribution(projects);
            }
        } catch (error) {
            console.error('Error calculating completion time distribution:', error);
            if (completionTimeChart) {
                completionTimeChart.innerHTML = '<div class="error-message">Failed to load completion time chart</div>';
            }
        }


        try {
            if (projectHealthGrid) {
                generateProjectHealthOverview(projects);
            }
        } catch (error) {
            console.error('Error generating project health overview:', error);
            if (projectHealthGrid) {
                projectHealthGrid.innerHTML = '<div class="error-message">Failed to load project health data</div>';
            }
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function calculateLocalCompletionRate(projects) {

    const result = {};
    projects.forEach(project => {
        const tasks = project.tasks || [];
        const totalTasks = tasks.length;
        if (totalTasks > 0) {
            const completedTasks = tasks.filter(t => t.status === 'completed').length;
            result[project.name] = Math.round((completedTasks / totalTasks) * 100);
        } else {
            result[project.name] = 0;
        }
    });
    return result;
}

function calculateLocalTaskVelocity(projects) {

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);


    const velocityData = {};
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        velocityData[dateKey] = 0;
    }


    projects.forEach(project => {
        const tasks = project.tasks || [];
        tasks.forEach(task => {
            if (task.status === 'completed' && task.completedAt) {
                const completedDate = new Date(task.completedAt);
                if (completedDate >= thirtyDaysAgo) {
                    const dateKey = completedDate.toISOString().split('T')[0];
                    if (velocityData[dateKey] !== undefined) {
                        velocityData[dateKey]++;
                    }
                }
            }
        });
    });

    return velocityData;
}

function calculateLocalCompletionTime(projects) {

    const distribution = {
        '1 day': 0,
        '2-3 days': 0,
        '4-7 days': 0,
        '1-2 weeks': 0,
        '2-4 weeks': 0,
        'Over 4 weeks': 0
    };

    projects.forEach(project => {
        const tasks = project.tasks || [];
        tasks.forEach(task => {
            if (task.status === 'completed' && task.completedAt && task.createdAt) {
                const created = new Date(task.createdAt);
                const completed = new Date(task.completedAt);
                const days = Math.round((completed - created) / (1000 * 60 * 60 * 24));

                if (days <= 1) distribution['1 day']++;
                else if (days <= 3) distribution['2-3 days']++;
                else if (days <= 7) distribution['4-7 days']++;
                else if (days <= 14) distribution['1-2 weeks']++;
                else if (days <= 28) distribution['2-4 weeks']++;
                else distribution['Over 4 weeks']++;
            }
        });
    });

    return distribution;
}

function calculateLocalProjectHealth(projects) {
    return projects.map(project => {

        const tasks = project.tasks || [];
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const totalTasks = tasks.length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


        const overdueTasks = tasks.filter(task => {
            if (task.status !== 'completed' && task.dueDate) {
                return new Date(task.dueDate) < new Date();
            }
            return false;
        }).length;


        const risks = project.risks || [];
        let maxRiskScore = 0;
        risks.forEach(risk => {
            const impact = String(risk.impact || '').toLowerCase();
            const probability = String(risk.probability || '').toLowerCase();

            const impactScore = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
            const probScore = probability === 'high' ? 3 : probability === 'medium' ? 2 : 1;

            const score = impactScore * probScore;
            if (score > maxRiskScore) maxRiskScore = score;
        });


        let healthScore = 0;

        healthScore += Math.min(40, progress * 0.4);

        const overdueRatio = totalTasks > 0 ? overdueTasks / totalTasks : 0;
        healthScore -= Math.min(30, overdueRatio * 100);

        healthScore -= Math.min(30, maxRiskScore * 3);

        healthScore = Math.max(0, Math.min(100, healthScore));

        return {
            id: project.id,
            name: project.name,
            health: {
                score: healthScore,
                progress: progress,
                completedTasks: completedTasks,
                totalTasks: totalTasks,
                overdueTasks: overdueTasks,
                riskScore: maxRiskScore
            }
        };
    });
}


function createTaskVelocityChart(velocityData) {
    const dates = Object.keys(velocityData).sort();
    const completedTaskCounts = dates.map(date => velocityData[date]);


    const movingAverages = [];
    for (let i = 0; i < completedTaskCounts.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - 2); j <= i; j++) {
            sum += completedTaskCounts[j];
            count++;
        }
        movingAverages.push(sum / count);
    }


    const ctx = document.getElementById('taskVelocityChart').getContext('2d');

    if (window.taskVelocityChart instanceof Chart) {
        window.taskVelocityChart.destroy();
    }

    window.taskVelocityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates.map(date => new Date(date).toLocaleDateString()),
            datasets: [{
                    type: 'bar',
                    label: 'Completed Tasks',
                    data: completedTaskCounts,
                    backgroundColor: 'rgba(74, 0, 224, 0.5)',
                    borderColor: 'rgba(74, 0, 224, 1)',
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: '3-Day Moving Average',
                    data: movingAverages,
                    borderColor: '#ff9800',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 90,
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Tasks Completed'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Task Completion Velocity (Last 30 Days)',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}


function createCompletionTimeChart(timeDistributionData) {
    const categories = {
        'within1Day': '1 day',
        'within3Days': '2-3 days',
        'within1Week': '4-7 days',
        'within2Weeks': '1-2 weeks',
        'moreThan2Weeks': 'Over 2 weeks'
    };

    const labels = Object.keys(timeDistributionData).map(key => categories[key] || key);
    const values = Object.values(timeDistributionData);


    const ctx = document.getElementById('completionTimeChart').getContext('2d');

    if (window.completionTimeChart instanceof Chart) {
        window.completionTimeChart.destroy();
    }

    window.completionTimeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#2e7d32',
                    '#4caf50',
                    '#8bc34a',
                    '#ffc107',
                    '#f44336'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Task Completion Time Distribution',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = values.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} tasks (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}


function renderProjectHealthGrid(healthData) {
    const projectHealthGrid = document.getElementById('projectHealthGrid');
    projectHealthGrid.innerHTML = '';

    if (!healthData || healthData.length === 0) {
        projectHealthGrid.innerHTML = '<div class="empty-state">No project health data available</div>';
        return;
    }


    healthData.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-health-card';


        const healthStatus = project.getHealthStatus || (
            project.score >= 80 ? 'Excellent' :
            project.score >= 60 ? 'Good' :
            project.score >= 40 ? 'Average' : 'Poor'
        );

        const healthColor =
            project.score >= 80 ? '#2e7d32' :
            project.score >= 60 ? '#4caf50' :
            project.score >= 40 ? '#ff9800' : '#f44336';

        card.innerHTML = `
            <h4 title="${project.name}">${project.name}</h4>
            <div class="project-health-metrics">
                <div class="health-metric">
                    <div class="health-metric-value">${project.progress}%</div>
                    <div class="health-metric-label">Progress</div>
                </div>
                <div class="health-metric">
                    <div class="health-metric-value">${project.completedTasks}/${project.totalTasks}</div>
                    <div class="health-metric-label">Tasks</div>
                </div>
                <div class="health-metric">
                    <div class="health-metric-value">${project.overdueTasks}</div>
                    <div class="health-metric-label">Overdue</div>
                </div>
            </div>
            <div class="health-indicator">
                <div class="health-indicator-bar">
                    <div class="health-indicator-fill" style="width: ${project.score}%; background-color: ${healthColor};"></div>
                </div>
                <div class="health-indicator-status health-status-${healthStatus.toLowerCase()}">${healthStatus}</div>
            </div>
        `;

        projectHealthGrid.appendChild(card);
    });
}

function calculateCompletionRate(projects) {
    const completedProjects = projects.filter(project => {
        const tasks = project.tasks || [];
        return tasks.length > 0 && tasks.every(task => task.status === 'completed');
    }).length;

    const inProgressProjects = projects.filter(project => {
        const tasks = project.tasks || [];
        return tasks.length > 0 && tasks.some(task => task.status === 'completed') && !tasks.every(task => task.status === 'completed');
    }).length;

    const notStartedProjects = projects.filter(project => {
        const tasks = project.tasks || [];
        return tasks.length === 0 || !tasks.some(task => task.status === 'completed');
    }).length;

    const ctx = document.getElementById('completionRateChart').getContext('2d');

    if (window.completionRateChart instanceof Chart) {
        window.completionRateChart.destroy();
    }

    window.completionRateChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [completedProjects, inProgressProjects, notStartedProjects],
                backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                borderColor: ['#4caf50', '#ff9800', '#f44336'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Project Status Overview',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = projects.length;
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function calculateTaskVelocity(projects) {

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);


    const taskVelocityData = {};
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        taskVelocityData[dateKey] = 0;
    }


    projects.forEach(project => {
        const tasks = project.tasks || [];
        tasks.forEach(task => {
            if (task.status === 'completed' && task.completedAt) {
                const completedDate = new Date(task.completedAt);
                if (completedDate >= thirtyDaysAgo && completedDate <= today) {
                    const dateKey = completedDate.toISOString().split('T')[0];
                    if (taskVelocityData[dateKey] !== undefined) {
                        taskVelocityData[dateKey]++;
                    }
                }
            }
        });
    });


    const dates = Object.keys(taskVelocityData).sort();
    const completedTaskCounts = dates.map(date => taskVelocityData[date]);


    const movingAverages = [];
    for (let i = 0; i < completedTaskCounts.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - 2); j <= i; j++) {
            sum += completedTaskCounts[j];
            count++;
        }
        movingAverages.push(sum / count);
    }


    const ctx = document.getElementById('taskVelocityChart').getContext('2d');

    if (window.taskVelocityChart instanceof Chart) {
        window.taskVelocityChart.destroy();
    }

    window.taskVelocityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates.map(date => new Date(date).toLocaleDateString()),
            datasets: [{
                    type: 'bar',
                    label: 'Completed Tasks',
                    data: completedTaskCounts,
                    backgroundColor: 'rgba(74, 0, 224, 0.5)',
                    borderColor: 'rgba(74, 0, 224, 1)',
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: '3-Day Moving Average',
                    data: movingAverages,
                    borderColor: '#ff9800',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 90,
                        autoSkip: true,
                        maxTicksLimit: 10
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Tasks Completed'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Task Completion Velocity (Last 30 Days)',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

function calculateCompletionTimeDistribution(projects) {

    const completionTimes = [];

    projects.forEach(project => {
        const tasks = project.tasks || [];
        tasks.forEach(task => {
            if (task.status === 'completed' && task.completedAt) {
                const createdDate = new Date(task.createdAt || project.createdAt);
                const completedDate = new Date(task.completedAt);
                const timeToComplete = (completedDate - createdDate) / (1000 * 60 * 60 * 24);
                if (timeToComplete >= 0) {
                    completionTimes.push(timeToComplete);
                }
            }
        });
    });


    const completionTimeBuckets = {
        '1 day': 0,
        '2-3 days': 0,
        '4-7 days': 0,
        '1-2 weeks': 0,
        '2-4 weeks': 0,
        'Over 4 weeks': 0
    };

    completionTimes.forEach(time => {
        if (time <= 1) completionTimeBuckets['1 day']++;
        else if (time <= 3) completionTimeBuckets['2-3 days']++;
        else if (time <= 7) completionTimeBuckets['4-7 days']++;
        else if (time <= 14) completionTimeBuckets['1-2 weeks']++;
        else if (time <= 28) completionTimeBuckets['2-4 weeks']++;
        else completionTimeBuckets['Over 4 weeks']++;
    });


    const ctx = document.getElementById('completionTimeChart').getContext('2d');

    if (window.completionTimeChart instanceof Chart) {
        window.completionTimeChart.destroy();
    }

    window.completionTimeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(completionTimeBuckets),
            datasets: [{
                data: Object.values(completionTimeBuckets),
                backgroundColor: [
                    '#2e7d32',
                    '#4caf50',
                    '#8bc34a',
                    '#ffc107',
                    '#ff9800',
                    '#f44336'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Task Completion Time Distribution',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = completionTimes.length;
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} tasks (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}


function generateProjectHealthOverview(projects) {
    const projectHealthGrid = document.getElementById('projectHealthGrid');
    if (!projectHealthGrid) {
        console.error('Project health grid element not found');
        return;
    }

    projectHealthGrid.innerHTML = '';

    if (!projects || projects.length === 0) {
        projectHealthGrid.innerHTML = '<div class="empty-state">No projects available</div>';
        return;
    }

    console.log('Generating project health overview with projects:', projects);


    const projectsWithHealth = projects.map(project => {

        const tasks = project.tasks || [];
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const totalTasks = tasks.length;

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


        const today = new Date();
        const overdueTasks = tasks.filter(task => {
            return task.status !== 'completed' &&
                task.dueDate &&
                new Date(task.dueDate) < today;
        }).length;


        const risks = project.risks || [];
        let maxRiskScore = 0;

        risks.forEach(risk => {
            const impactStr = String(risk.impact || '').toLowerCase();
            const probabilityStr = String(risk.probability || '').toLowerCase();

            const impactScore = impactStr === 'high' ? 3 :
                impactStr === 'medium' ? 2 : 1;

            const probScore = probabilityStr === 'high' ? 3 :
                probabilityStr === 'medium' ? 2 : 1;

            const score = impactScore * probScore;
            if (score > maxRiskScore) {
                maxRiskScore = score;
            }
        });


        let healthScore = 100;


        healthScore -= Math.min(40, (100 - progress) * 0.4);


        const overdueRatio = totalTasks > 0 ? overdueTasks / totalTasks : 0;
        healthScore -= Math.min(30, overdueRatio * 100);


        healthScore -= Math.min(30, maxRiskScore * 3);


        healthScore = Math.max(0, Math.min(100, healthScore));

        return {
            id: project.id,
            name: project.name,
            health: {
                score: healthScore,
                progress: progress,
                completedTasks: completedTasks,
                totalTasks: totalTasks,
                overdueTasks: overdueTasks,
                riskScore: maxRiskScore
            }
        };
    }).sort((a, b) => b.health.score - a.health.score);

    console.log('Projects with health data:', projectsWithHealth);


    projectsWithHealth.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-health-card';


        let healthStatus = '';
        let healthColor = '';

        if (project.health.score >= 80) {
            healthStatus = 'Excellent';
            healthColor = '#2e7d32';
        } else if (project.health.score >= 60) {
            healthStatus = 'Good';
            healthColor = '#4caf50';
        } else if (project.health.score >= 40) {
            healthStatus = 'Average';
            healthColor = '#ff9800';
        } else {
            healthStatus = 'Poor';
            healthColor = '#f44336';
        }


        card.innerHTML = `
            <h4 title="${project.name}">${project.name}</h4>
            <div class="project-health-metrics">
                <div class="health-metric">
                    <div class="health-metric-value">${project.health.progress}%</div>
                    <div class="health-metric-label">Progress</div>
                </div>
                <div class="health-metric">
                    <div class="health-metric-value">${project.health.completedTasks}/${project.health.totalTasks}</div>
                    <div class="health-metric-label">Tasks</div>
                </div>
                <div class="health-metric">
                    <div class="health-metric-value">${project.health.overdueTasks}</div>
                    <div class="health-metric-label">Overdue</div>
                </div>
            </div>
            <div class="health-indicator">
                <div class="health-indicator-bar">
                    <div class="health-indicator-fill" style="width: ${project.health.score}%; background-color: ${healthColor};"></div>
                </div>
                <div class="health-indicator-status health-status-${healthStatus.toLowerCase()}">${healthStatus}</div>
            </div>
        `;

        projectHealthGrid.appendChild(card);
    });
}



function showView(viewName) {

    const dashboardView = document.getElementById('dashboardView');
    const projectDetailsView = document.getElementById('projectDetailsView');
    const timelineView = document.getElementById('timelineView');
    const statisticsView = document.getElementById('statisticsView');

    console.log(`Switching to view: ${viewName}`);


    const allViews = [dashboardView, projectDetailsView, timelineView, statisticsView];
    allViews.forEach(view => {
        if (view) {
            view.style.display = 'none';

            view.setAttribute('style', 'display: none !important');
        }
    });


    let viewToShow = null;

    if (viewName === 'dashboard' && dashboardView) {
        viewToShow = dashboardView;
    } else if (viewName === 'project' && projectDetailsView && currentProjectId) {
        viewToShow = projectDetailsView;
    } else if (viewName === 'timeline' && timelineView) {
        viewToShow = timelineView;
        loadMasterTimeline();
    } else if (viewName === 'statistics' && statisticsView) {
        viewToShow = statisticsView;
        loadStatistics();
    }

    if (viewToShow) {

        viewToShow.removeAttribute('style');
        viewToShow.style.display = 'block';
    }


    const navLinks = document.querySelectorAll('.header-right a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(viewName)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    console.log(`View switch complete. Now showing: ${viewName}`);
}


function goBackToDashboard() {
    showView('dashboard');
    loadDashboard();
}


function showTimelineView() {

    showView('timeline');


    loadMasterTimeline();
}


async function loadMasterTimeline() {
    try {
        console.log('Loading master timeline...');


        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);


        const startDateInput = document.getElementById('timelineStartDate');
        const endDateInput = document.getElementById('timelineEndDate');

        if (startDateInput && endDateInput) {
            startDateInput.valueAsDate = startDate;
            endDateInput.valueAsDate = endDate;
        }


        const projects = await fetchProjects();
        populateProjectFilter(projects);


        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        console.log(`Fetching timeline data from ${startDateStr} to ${endDateStr}`);


        const timelineData = await getTimeline(startDateStr, endDateStr);


        generateMasterTimeline(timelineData);
    } catch (error) {
        console.error('Error loading master timeline:', error);
        const timelineContainer = document.getElementById('masterTimeline');
        if (timelineContainer) {
            timelineContainer.innerHTML = `<div class="error-message">
                Failed to load timeline data: ${error.message || 'Unknown error'}
            </div>`;
        }
    }
}


function showStatisticsView() {
    showView('statistics');
}


async function viewProject(id) {
    console.log(`Attempting to view project with ID: ${id}`);
    try {
        currentProjectId = id;


        showView('project');


        const project = await getProject(id);

        document.getElementById('projectTitle').textContent = project.name;
        document.getElementById('projectDescription').textContent = project.description || 'No description available';


        renderTasks(project.tasks || []);
        updateCharts(project.tasks || [], project);
        loadMilestones(project.milestones || []);
        renderRisks(project.risks || []);
        renderTeamWorkload(project.id);


        await updateProjectProgress(project.id);

    } catch (error) {
        console.error('Error viewing project:', error);
    }
}

function initializeDropdown() {
    document.addEventListener('click', function (event) {
        const dropdown = document.getElementById('roleDropdown');
        const dropdownContent = document.getElementById('roleDropdownContent');

        if (dropdown && dropdownContent &&
            !dropdown.contains(event.target) &&
            !dropdownContent.contains(event.target)) {
            dropdownContent.style.display = 'none';
        }
    });

    const roleDropdown = document.getElementById('roleDropdown');
    if (roleDropdown) {

        const newDropdown = roleDropdown.cloneNode(true);
        roleDropdown.parentNode.replaceChild(newDropdown, roleDropdown);

        newDropdown.addEventListener('click', function (event) {
            toggleRoleDropdown(event);
        });
    }

    const dropdownContent = document.getElementById('roleDropdownContent');
    if (dropdownContent) {
        dropdownContent.addEventListener('click', function (event) {
            event.stopPropagation();
        });
    }
}

let taskViewMode = "content";

function toggleTaskView() {
    const taskList = document.getElementById('taskList');
    const viewToggleButton = document.getElementById('viewToggleButton');

    if (!taskList || !viewToggleButton) return;

    if (taskViewMode === "content") {

        taskList.classList.add('list-view');
        taskViewMode = "list";
        viewToggleButton.innerHTML = `
            <svg class="content-view-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
            <span>Content View</span>
        `;
        console.log("Switched to list view");
    } else {

        taskList.classList.remove('list-view');
        taskViewMode = "content";
        viewToggleButton.innerHTML = `
            <svg class="list-view-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>List View</span>
        `;
        console.log("Switched to content view");
    }

    localStorage.setItem('epsilon-task-view', taskViewMode);
}

function searchTasks() {
    const searchText = document.getElementById('taskSearch').value.toLowerCase().trim();
    const taskItems = document.querySelectorAll('.task-item');

    taskItems.forEach(task => {
        const taskName = task.querySelector('h4').textContent.toLowerCase();
        const taskDescription = task.querySelector('.task-description').textContent.toLowerCase();
        const taskAssignee = task.querySelector('.assigned-to').textContent.toLowerCase();
        const taskPriority = task.className.match(/priority-(\w+)/) ? . [1] ? .toLowerCase() || '';

        const tagElements = task.querySelectorAll('.task-tag');
        let taskTags = '';
        tagElements.forEach(tag => {
            taskTags += tag.textContent.toLowerCase() + ' ';
        });

        if (taskName.includes(searchText) ||
            taskDescription.includes(searchText) ||
            taskAssignee.includes(searchText) ||
            taskPriority.includes(searchText) ||
            taskTags.includes(searchText)) {
            task.style.display = '';
        } else {
            task.style.display = 'none';
        }
    });
}

function initializeTaskView() {
    const savedViewMode = localStorage.getItem('epsilon-task-view') || 'content';
    taskViewMode = savedViewMode;

    const taskList = document.getElementById('taskList');
    const viewToggleButton = document.getElementById('viewToggleButton');

    if (!taskList || !viewToggleButton) return;

    if (taskViewMode === 'list') {
        taskList.classList.add('list-view');
        viewToggleButton.innerHTML = `
            <svg class="content-view-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
            <span>Content View</span>
        `;
    } else {
        taskList.classList.remove('list-view');
        viewToggleButton.innerHTML = `
            <svg class="list-view-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>List View</span>
        `;
    }
}


async function loadTimeline() {
    try {

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);

        document.getElementById('timelineStartDate').valueAsDate = startDate;
        document.getElementById('timelineEndDate').valueAsDate = endDate;


        const projects = await fetchProjects();
        populateProjectFilter(projects);


        const timelineData = await getTimeline(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
        );


        generateMasterTimeline(timelineData);
    } catch (error) {
        console.error('Error loading timeline:', error);
        alert('Failed to load timeline data: ' + error.message);
    }
}


function populateProjectFilter(projects) {
    const projectFilter = document.getElementById('projectFilter');
    if (!projectFilter) return;


    while (projectFilter.options.length > 1) {
        projectFilter.remove(1);
    }


    if (projects && projects.length > 0) {
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectFilter.appendChild(option);
        });
    }
}


function filterTimeline() {
    const selectedProjectId = document.getElementById('projectFilter').value;
    const startDate = document.getElementById('timelineStartDate').valueAsDate;
    const endDate = document.getElementById('timelineEndDate').valueAsDate;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    if (startDate > endDate) {
        alert('Start date must be before end date');
        return;
    }


    loadFilteredTimeline(selectedProjectId, startDate, endDate);
}


function filterTimelineByDate() {
    filterTimeline();
}


async function loadFilteredTimeline(projectId, startDate, endDate) {
    try {
        let timelineData;

        if (projectId === 'all') {
            timelineData = await getTimeline(startDate, endDate);
        } else {
            const projectTimelineData = await getProjectTimeline(parseInt(projectId), startDate, endDate);


            timelineData = {
                events: projectTimelineData.events || [],
                startDate: startDate,
                endDate: endDate
            };
        }

        generateMasterTimeline(timelineData);
    } catch (error) {
        console.error('Error filtering timeline:', error);
        alert('Failed to update timeline: ' + error.message);
    }
}


async function getTimeline(startDate, endDate) {
    try {
        const url = `${API_BASE_URL}/timeline?startDate=${startDate}&endDate=${endDate}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching timeline data:', error);


        return {
            events: []
        };
    }
}





function generateMasterTimeline(timelineData) {
    const timelineContainer = document.getElementById('masterTimeline');
    timelineContainer.innerHTML = '';

    if (!timelineData.events || timelineData.events.length === 0) {
        timelineContainer.innerHTML = '<div class="empty-state">No events found for the selected time period</div>';
        return;
    }


    const eventsByProject = {};
    timelineData.events.forEach(event => {
        if (!eventsByProject[event.projectId]) {
            eventsByProject[event.projectId] = {
                projectId: event.projectId,
                projectName: event.projectName,
                projectColor: event.projectColor,
                events: []
            };
        }

        eventsByProject[event.projectId].events.push(event);
    });


    let lastMonth = null;

    Object.values(eventsByProject).forEach(project => {
        const projectSection = document.createElement('div');
        projectSection.className = 'timeline-project';

        projectSection.innerHTML = `
            <div class="timeline-project-header">
                <div class="timeline-project-color" style="background-color: ${project.projectColor}"></div>
                <span>${project.projectName}</span>
            </div>
            <div class="timeline-events" id="timeline-events-${project.projectId}"></div>
        `;

        timelineContainer.appendChild(projectSection);

        const eventsContainer = document.getElementById(`timeline-events-${project.projectId}`);

        project.events.forEach(event => {

            const eventDate = new Date(event.date);
            const eventMonth = `${eventDate.toLocaleString('default', { month: 'long' })} ${eventDate.getFullYear()}`;

            if (eventMonth !== lastMonth) {
                const monthLabel = document.createElement('div');
                monthLabel.className = 'timeline-month';
                monthLabel.textContent = eventMonth;

                const monthSeparator = document.createElement('div');
                monthSeparator.className = 'timeline-month-separator';
                monthSeparator.appendChild(monthLabel);

                eventsContainer.appendChild(monthSeparator);

                lastMonth = eventMonth;
            }

            const eventElement = document.createElement('div');
            eventElement.className = `timeline-event ${event.type}`;


            if (event.type === 'task') {
                eventElement.innerHTML = `
                    <div class="timeline-event-header">
                        <div class="timeline-event-title">${event.title}</div>
                        <div class="timeline-event-date">${new Date(event.date).toLocaleDateString()}</div>
                    </div>
                    <div class="timeline-event-description">${event.description || 'No description'}</div>
                    <div class="timeline-event-meta">
                        <span class="status-indicator ${event.status}">${event.status}</span>
                        <span class="assignee"><i class="task-icon">👤</i> ${event.additionalData?.assignedTo || 'Unassigned'}</span>
                        <span class="priority-badge ${event.additionalData?.priority || 'medium'}">${event.additionalData?.priority || 'medium'}</span>
                    </div>
                `;
            } else if (event.type === 'milestone') {
                eventElement.innerHTML = `
                    <div class="timeline-event-header">
                        <div class="timeline-event-title">🏁 ${event.title}</div>
                        <div class="timeline-event-date">${new Date(event.date).toLocaleDateString()}</div>
                    </div>
                    <div class="timeline-event-description">${event.description || 'No description'}</div>
                    <div class="timeline-event-meta">
                        <span class="status-indicator ${event.status}">${event.status}</span>
                    </div>
                `;
            } else if (event.type === 'risk') {
                eventElement.innerHTML = `
                    <div class="timeline-event-header">
                        <div class="timeline-event-title">⚠️ Risk: ${event.title}</div>
                        <div class="timeline-event-date">${new Date(event.date).toLocaleDateString()}</div>
                    </div>
                    <div class="timeline-event-meta">
                        <span>Impact: ${event.additionalData?.impact || 'Medium'}</span>
                        <span>Probability: ${event.additionalData?.probability || 'Medium'}</span>
                        ${event.additionalData?.riskScore ? `<span>Risk Score: ${event.additionalData.riskScore}</span>` : ''}
                    </div>
                    <div class="timeline-event-description">${event.description || 'No mitigation strategy provided'}</div>
                `;
            }

            eventsContainer.appendChild(eventElement);
        });
    });
}


document.addEventListener('DOMContentLoaded', function () {
    // if (window.location.pathname.endsWith(".html")) {
    //     window.history.replaceState(null, "", window.location.pathname.replace(".html", ""));
    // }

    const dashboardLink = document.querySelector('a[href="#dashboard"]');
    if (dashboardLink) {
        dashboardLink.addEventListener('click', function (e) {
            e.preventDefault();
            goBackToDashboard();
        });
    }

    const timelineLink = document.querySelector('a[href="#timeline"]');
    if (timelineLink) {
        timelineLink.addEventListener('click', function (e) {
            e.preventDefault();
            showTimelineView();
        });
    }

    const statisticsLink = document.querySelector('a[href="#statistics"]');
    if (statisticsLink) {
        statisticsLink.addEventListener('click', function (e) {
            e.preventDefault();
            showStatisticsView();
        });
    }


    document.querySelectorAll('.header-right a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            const viewName = href.substring(1);
            link.addEventListener('click', function (e) {
                e.preventDefault();
                showView(viewName);
            });
        }
    });


    const style = document.createElement('style');
    style.textContent = `
        .loading-indicator {
            padding: 20px;
            text-align: center;
            color: #666;
        }
        .error-message {
            padding: 20px;
            text-align: center;
            color: #dc3545;
            background-color: rgba(220, 53, 69, 0.1);
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            showView(view);


            if (view === 'timeline') {
                loadMasterTimeline();
            } else if (view === 'statistics') {
                loadStatistics();
            }
        });
    });


    document.querySelector('.logo').addEventListener('click', function () {
        showView('dashboard');
    });

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('epsilon-theme', isDark ? 'dark' : 'light');
            updateThemeIcons();
        });
    }

    const savedTheme = localStorage.getItem('epsilon-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcons();
    }


    setTimeout(initializeRoleDropdown, 100);

    const roleDisplay = document.getElementById('userRoleDisplay');
    if (roleDisplay) {
        roleDisplay.addEventListener('click', function (event) {
            toggleRoleDropdown(event);
        });
    }


    document.addEventListener('click', function (event) {
        const dropdown = document.querySelector('.role-dropdown');
        const dropdownContent = document.getElementById('roleDropdownContent');

        if (dropdown && dropdownContent && !dropdown.contains(event.target)) {
            dropdownContent.style.display = 'none';
        }
    });

    const dropdownContent = document.getElementById('roleDropdownContent');
    if (dropdownContent) {
        dropdownContent.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }


    initializeDropdown();


    loadDashboard();


    const newThemeToggle = document.getElementById('theme-toggle');
    if (newThemeToggle) {
        const clonedThemeToggle = newThemeToggle.cloneNode(true);
        newThemeToggle.parentNode.replaceChild(clonedThemeToggle, newThemeToggle);

        clonedThemeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('epsilon-theme', isDark ? 'dark' : 'light');
            updateThemeIcons();
        });
    }


    setupRoleDropdown();

    const savedRole = localStorage.getItem('epsilon-role') || 'leader';
    currentUserRole = savedRole;

    updateRoleDisplay(savedRole);
    updateUIBasedOnRole();


    const projectDetailsView = document.getElementById('projectDetailsView');
    if (projectDetailsView) {
        projectDetailsView.style.display = 'none';
    }


    const timelineView = document.getElementById('timelineView');
    if (timelineView) {
        timelineView.style.display = 'none';
    }

    const statisticsView = document.getElementById('statisticsView');
    if (statisticsView) {
        statisticsView.style.display = 'none';
    }
});