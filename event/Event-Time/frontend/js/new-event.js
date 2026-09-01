document.addEventListener('DOMContentLoaded', function() {
    // Ensure user is authenticated
    if (!authUtils.isAuthenticated()) {
        authUtils.redirectToLogin();
        return;
    }

    const form = document.getElementById('createEventForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        authUtils.setButtonLoading(submitBtn, true);

        // Collect form values
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const category = document.getElementById('category').value.trim();
        const location = document.getElementById('location').value.trim();
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const endTime = document.getElementById('endTime').value;
        const price = parseFloat(document.getElementById('price').value) || 0;
        const maxCapacity = parseInt(document.getElementById('maxCapacity').value) || null;
        const image = document.getElementById('image_url').value.trim();

        // Basic validation
        if (!title || !date || !time) {
            authUtils.showError('formError', 'Title, date and time are required');
            authUtils.setButtonLoading(submitBtn, false);
            return;
        }

        const payload = {
            title,
            description,
            category,
            location,
            date,
            time,
            endTime: endTime || null,
            price,
            maxCapacity,
            image
        };

        try {
            const res = await authUtils.apiCall('/events', 'POST', payload);
            if (res && res.success) {
                authUtils.showSuccess('formSuccess', 'Event created successfully. Redirecting to events...');
                setTimeout(() => { window.location.href = 'event_list.html'; }, 1500);
            } else {
                throw new Error((res && res.message) || 'Create event failed');
            }
        } catch (err) {
            console.error('Create event error', err);
            authUtils.showError('formError', err.message || 'Failed to create event');
        } finally {
            authUtils.setButtonLoading(submitBtn, false);
        }
    });
});
