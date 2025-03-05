function updateProjectChart(tasks) {
    const ctx = document.getElementById('projectChart').getContext('2d');

    if (window.projectChart instanceof Chart) {
        window.projectChart.destroy();
    }

    if (!tasks || tasks.length === 0) {
        return;
    }

    const taskStats = {
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completed: tasks.filter(t => t.status === 'completed').length
    };

    window.projectChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'In Progress', 'Completed'],
            datasets: [{
                data: [taskStats.pending, taskStats.inProgress, taskStats.completed],
                backgroundColor: ['#ffc107', '#17a2b8', '#28a745'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createBurndownChart(tasks, projectStartDate, projectEndDate) {
    const burndownCanvas = document.getElementById('burndownChart');
    if (!burndownCanvas) return;

    if (window.burndownChartInstance) {
        window.burndownChartInstance.destroy();
    }

    const totalTasks = tasks.length;
    const startDate = new Date(projectStartDate);
    const endDate = new Date(projectEndDate);
    const projectDuration = (endDate - startDate) / (1000 * 60 * 60 * 24);

    const idealBurndown = [];
    const labels = [];
    const taskCompletionData = [];

    for (let i = 0; i <= projectDuration; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        labels.push(date.toLocaleDateString());

        const tasksRemaining = Math.round(totalTasks * (1 - (i / projectDuration)));
        idealBurndown.push(tasksRemaining);

        const completedByDate = tasks.filter(task =>
            task.status === 'completed' &&
            new Date(task.completedAt || task.dueDate) <= date
        ).length;

        taskCompletionData.push(totalTasks - completedByDate);
    }

    const ctx = burndownCanvas.getContext('2d');
    window.burndownChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                    label: 'Ideal Burndown',
                    data: idealBurndown,
                    borderColor: 'rgba(74, 0, 224, 0.5)',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: 'Actual Progress',
                    data: taskCompletionData,
                    borderColor: '#4a00e0',
                    backgroundColor: 'rgba(74, 0, 224, 0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#4a00e0',
                    fill: true
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
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Tasks Remaining'
                    },
                    min: 0,
                    suggestedMax: totalTasks
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Project Burndown Chart',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

async function createPriorityChart(tasks, projectId) {
    const priorityCanvas = document.getElementById('priorityChart');
    if (!priorityCanvas) return;

    if (window.priorityChartInstance) {
        window.priorityChartInstance.destroy();
    }

    try {

        const priorityData = await getTaskPriorityDistribution(projectId);

        const ctx = priorityCanvas.getContext('2d');
        window.priorityChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                    data: [
                        priorityData.high || 0,
                        priorityData.medium || 0,
                        priorityData.low || 0
                    ],
                    backgroundColor: ['#ff4444', '#ffbb33', '#00C851'],
                    borderColor: ['#ff4444', '#ffbb33', '#00C851'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error creating priority chart:", error);
    }
}