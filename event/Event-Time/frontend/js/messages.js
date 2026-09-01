document.addEventListener('DOMContentLoaded', function() {
    if (!authUtils.isAuthenticated()) {
        authUtils.redirectToLogin();
        return;
    }

    const inbox = document.getElementById('messagesContainer');
    const sendForm = document.getElementById('sendMessageForm');

    async function loadMessages() {
        if (!inbox) return;
        inbox.innerHTML = '<p>Loading messages...</p>';
        try {
            const res = await authUtils.apiCall('/messages');
            if (!res || !res.success) {
                inbox.innerHTML = `<p class=\"events-status events-error\">${(res && res.message) || 'Unable to load messages'}</p>`;
                return;
            }
            renderMessages(res.data || []);
        } catch (err) {
            console.error('Messages error', err);
            inbox.innerHTML = `<p class=\"events-status events-error\">Error loading messages: ${err.message}</p>`;
        }
    }

    function renderMessages(messages) {
        if (!inbox) return;
        if (!messages.length) {
            inbox.innerHTML = '<p>No messages yet.</p>';
            return;
        }
        inbox.innerHTML = messages.map(m => messageCard(m)).join('');
    }

    function messageCard(m) {
        const from = m.from_user_id === authUtils.getUserData()?.id ? 'You' : (m.from_user_id || 'User');
        return `
            <div class="message-card">
                <strong>${escapeHtml(from)}</strong>
                <div>${escapeHtml(m.content)}</div>
                <small>${new Date(m.created_at).toLocaleString()}</small>
            </div>
        `;
    }

    if (sendForm) {
        sendForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const toUserId = document.getElementById('toUserId').value.trim();
            const content = document.getElementById('messageContent').value.trim();
            if (!toUserId || !content) {
                authUtils.showError('formError', 'Recipient and message are required');
                return;
            }
            try {
                await authUtils.apiCall('/messages', 'POST', { toUserId, content });
                authUtils.showSuccess('formSuccess', 'Message sent');
                document.getElementById('messageContent').value = '';
                await loadMessages();
            } catch (err) {
                console.error('Send message error', err);
                authUtils.showError('formError', err.message || 'Could not send message');
            }
        });
    }

    function escapeHtml(s){ const d = document.createElement('div'); d.textContent = String(s||''); return d.innerHTML; }

    loadMessages();
});
