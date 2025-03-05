const API_BASE_URL = '/api';

async function fetchProjects() {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to add project');
    return await response.json();
}

async function deleteProject(id) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete project');
}

async function deleteMilestoneApi(projectId, milestoneId) {
    console.log(`Deleting milestone ${milestoneId} from project ${projectId}`);
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones/${milestoneId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`Failed to delete milestone: ${response.statusText}`);
    }

    return true;
}

async function deleteRiskApi(projectId, riskId) {
    console.log(`Deleting risk ${riskId} from project ${projectId}`);
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/risks/${riskId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}): ${errorText}`);
        throw new Error(`Failed to delete risk: ${response.statusText}`);
    }

    return true;
}
async function getProject(id) {
    try {
        console.log(`API call: fetching project ${id}`);
        const response = await fetch(`${API_BASE_URL}/projects/${id}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}): ${errorText}`);
            throw new Error(`Failed to fetch project: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API response:', data);
        return data;
    } catch (error) {
        console.error('Error in getProject:', error);
        throw error;
    }
}

async function addTask(projectId, taskName, description, priority, dueDate, assignedTo, tags = []) {
    try {

        const normalizedTags = Array.isArray(tags) ?
            tags.map(tag => typeof tag === 'object' ? tag.toString() : tag) : [];

        const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: taskName,
                description,
                priority,
                dueDate,
                assignedTo,
                tags: normalizedTags
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to add task');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding task:', error);
        throw error;
    }
}

async function updateTaskStatus(projectId, taskId, newStatus) {
    try {
        const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: newStatus
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update task status');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
    }
}

async function getMilestones(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones`);
    if (!response.ok) throw new Error('Failed to fetch milestones');
    return await response.json();
}

async function addMilestone(projectId, name, description, dueDate) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name,
            description,
            dueDate
        })
    });
    if (!response.ok) throw new Error('Failed to add milestone');
    return await response.json();
}

async function completeMilestone(projectId, milestoneId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones/${milestoneId}/complete`, {
        method: 'PATCH'
    });
    if (!response.ok) throw new Error('Failed to complete milestone');
    return await response.json();
}

async function getRisks(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/risks`);
    if (!response.ok) throw new Error('Failed to fetch risks');
    return await response.json();
}

async function addRisk(projectId, description, impact, probability, mitigation) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/risks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            description,
            impact,
            probability,
            mitigationStrategy: mitigation
        })
    });
    if (!response.ok) throw new Error('Failed to add risk');
    return await response.json();
}

async function getAllTags() {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) throw new Error('Failed to fetch tags');
    return await response.json();
}

async function addTag(name) {
    const response = await fetch(`${API_BASE_URL}/tags`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name
        })
    });
    if (!response.ok) throw new Error('Failed to add tag');
    return await response.json();
}

async function addTagToTask(projectId, taskId, tagName) {
    const response = await fetch(`${API_BASE_URL}/tags/tasks/${taskId}?projectId=${projectId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: tagName
        })
    });
    if (!response.ok) throw new Error('Failed to add tag to task');
    return await response.json();
}

async function getTaskPriorityDistribution(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/analytics/priority-distribution`);
    if (!response.ok) throw new Error('Failed to fetch priority distribution');
    return await response.json();
}

async function getWorkloadDistribution(projectId) {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}/analytics/workload`);
    if (!response.ok) throw new Error('Failed to fetch workload distribution');
    return await response.json();
}




async function getTimeline(startDate, endDate) {
    try {
        const formattedStartDate = startDate instanceof Date ? startDate.toISOString() : startDate;
        const formattedEndDate = endDate instanceof Date ? endDate.toISOString() : endDate;

        const response = await fetch(
            `${API_BASE_URL}/timeline?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch timeline data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getTimeline:', error);
        throw error;
    }
}


async function getProjectTimeline(projectId, startDate, endDate) {
    try {
        const formattedStartDate = startDate instanceof Date ? startDate.toISOString() : startDate;
        const formattedEndDate = endDate instanceof Date ? endDate.toISOString() : endDate;

        const response = await fetch(
            `${API_BASE_URL}/timeline/${projectId}?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch timeline data for project ${projectId}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in getProjectTimeline:', error);
        throw error;
    }
}


async function getCompletionRateStats() {
    const response = await fetch(`${API_BASE_URL}/stats/completion-rate`);
    if (!response.ok) throw new Error('Failed to fetch completion rate stats');
    return await response.json();
}


async function getTaskVelocityData(days = 30) {
    const response = await fetch(`${API_BASE_URL}/stats/task-velocity?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch task velocity data');
    return await response.json();
}


async function getCompletionTimeDistribution() {
    const response = await fetch(`${API_BASE_URL}/stats/completion-time`);
    if (!response.ok) throw new Error('Failed to fetch completion time distribution');
    return await response.json();
}


async function getProjectHealthOverview() {
    const response = await fetch(`${API_BASE_URL}/stats/project-health`);
    if (!response.ok) throw new Error('Failed to fetch project health data');
    return await response.json();
}