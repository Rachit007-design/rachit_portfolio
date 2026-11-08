/* ============================================
   WORK PAGE — tabs, chat demo, workflow demos
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Tabs ---
    const tabs = document.querySelectorAll('.work-tab');
    const panels = document.querySelectorAll('.work-panel');

    function showTab(name) {
        tabs.forEach(t => {
            const on = t.dataset.tab === name;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(p => p.classList.toggle('active', p.id === 'panel-' + name));
        // Reveal elements inside the newly shown panel
        document.querySelectorAll('#panel-' + name + ' .reveal').forEach(el => el.classList.add('visible'));
    }

    tabs.forEach(t => t.addEventListener('click', () => {
        showTab(t.dataset.tab);
        history.replaceState(null, '', '#' + t.dataset.tab);
    }));

    if (location.hash === '#content') showTab('content');

    // --- WhatsApp chat demo (loops) ---
    const chat = document.querySelector('[data-chat-demo]');
    if (chat) {
        const steps = [...chat.querySelectorAll('[data-step]')];
        const typing = chat.querySelector('.typing');
        let timers = [];
        let running = false;

        const clear = () => { timers.forEach(clearTimeout); timers = []; };
        const at = (ms, fn) => timers.push(setTimeout(fn, ms));

        function play() {
            clear();
            steps.forEach(s => s.classList.remove('show'));
            typing.classList.remove('show');
            if (reduceMotion) { steps.forEach(s => s.classList.add('show')); return; }

            let t = 600;
            steps.forEach(step => {
                const isBot = step.classList.contains('msg-out');
                if (isBot) {
                    at(t, () => { chat.insertBefore(typing, step); typing.classList.add('show'); });
                    t += 1300;
                    at(t, () => { typing.classList.remove('show'); step.classList.add('show'); });
                } else {
                    at(t, () => step.classList.add('show'));
                }
                t += isBot ? 1500 : 1300;
            });
            at(t + 4000, () => { if (running) play(); });
        }

        const chatObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && !running) { running = true; play(); }
                if (!e.isIntersecting && running) { running = false; clear(); }
            });
        }, { threshold: 0.3 });
        chatObserver.observe(chat);
    }

    // --- Workflow diagrams (light up node by node, then loop) ---
    document.querySelectorAll('[data-flow-demo]').forEach(flow => {
        const items = [...flow.children]; // nodes and links in order
        let timers = [];
        let running = false;

        const clear = () => { timers.forEach(clearTimeout); timers = []; };

        function play() {
            clear();
            items.forEach(i => i.classList.remove('lit'));
            if (reduceMotion) { items.forEach(i => i.classList.add('lit')); return; }
            items.forEach((item, idx) => {
                timers.push(setTimeout(() => item.classList.add('lit'), 400 + idx * 450));
            });
            timers.push(setTimeout(() => { if (running) play(); }, 400 + items.length * 450 + 3500));
        }

        const flowObserver = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && !running) { running = true; play(); }
                if (!e.isIntersecting && running) { running = false; clear(); }
            });
        }, { threshold: 0.4 });
        flowObserver.observe(flow);
    });
});
