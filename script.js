(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // Original-template interactive hanging ID card.
  const originalCard = $('#originalIdCard');
  const originalFlip = $('#originalIdFlip');
  if (originalCard && originalFlip) {
    const flipOriginalCard = () => originalFlip.classList.toggle('back');
    originalCard.addEventListener('click', flipOriginalCard);
    originalCard.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flipOriginalCard(); }
    });
  }
  const originalTyping = $('#originalTyping');
  if (originalTyping) {
    const phrases = ['Building, testing, learning', 'AI/ML · Research · Development', 'Curiosity into code'];
    if (reduceMotion) originalTyping.textContent = phrases[0];
    else { let phrase = 0, char = 0, deleting = false; const type = () => {
      const current = phrases[phrase]; char += deleting ? -1 : 1; originalTyping.textContent = current.slice(0, char);
      let delay = deleting ? 25 : 48;
      if (!deleting && char === current.length) { deleting = true; delay = 1250; }
      else if (deleting && char === 0) { deleting = false; phrase = (phrase + 1) % phrases.length; delay = 260; }
      window.setTimeout(type, delay);
    }; type(); }
  }


  // Interactive pastel keyboard: jump to real portfolio sections.
  const keyboard = $('.portfolio-keyboard');
  if (keyboard) {
    const keys = $$('.portfolio-key', keyboard);
    const resizeKeyboard = () => {
      const parentStyle = window.getComputedStyle(keyboard.parentElement);
      const available = keyboard.parentElement.clientWidth - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight);
      const scale = Math.min(1, available / 900);
      keyboard.style.setProperty('--key-scale', String(scale));
    };
    resizeKeyboard();
    window.addEventListener('resize', resizeKeyboard, { passive: true });

    keys.forEach(key => {
      key.addEventListener('click', event => {
        if (key.tagName.toLowerCase() === 'a') return;
        const target = $(key.dataset.target);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });

    if (!reduceMotion) {
      const sequence = [...keys];
      let step = 0;
      let timer;
      const stopSequence = () => {
        window.clearTimeout(timer);
        sequence.forEach(key => key.classList.remove('is-pressing'));
      };
      const runSequence = () => {
        stopSequence();
        if (document.hidden || keyboard.matches(':hover') || keys.some(key => key === document.activeElement) || $('dialog[open]')) {
          timer = window.setTimeout(runSequence, 700);
          return;
        }
        const key = sequence[step];
        key.classList.add('is-pressing');
        timer = window.setTimeout(() => {
          key.classList.remove('is-pressing');
          step = (step + 1) % sequence.length;
          timer = window.setTimeout(runSequence, 110);
        }, 180);
      };
      keyboard.addEventListener('pointerenter', stopSequence);
      keyboard.addEventListener('pointerleave', () => { timer = window.setTimeout(runSequence, 500); });
      keyboard.addEventListener('focusin', stopSequence);
      keyboard.addEventListener('focusout', () => { timer = window.setTimeout(runSequence, 500); });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopSequence();
        else timer = window.setTimeout(runSequence, 500);
      });
      timer = window.setTimeout(runSequence, 700);
    }
  }

  // Update the year and reading progress.
  $('#currentYear').textContent = new Date().getFullYear();
  const progress = $('#scrollProgress');
  const header = $('#siteHeader');
  const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
    header.classList.toggle('scrolled', window.scrollY > 18);
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  // Mobile navigation.
  const menuToggle = $('#menuToggle');
  const navLinks = $('#navLinks');
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#navLinks a').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  // Theme toggle, kept client-side only (no storage requirement).
  $('#themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('soft-theme');
    const light = document.body.classList.contains('soft-theme');
    $('#themeToggle').textContent = light ? '☾' : '◐';
    $('#themeToggle').setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  });

  // Small role rotator in the hero.
  const roles = ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'AI-powered applications', 'Research & experiments'];
  const roleEl = $('#rotatingRole');
  if (!reduceMotion) {
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % roles.length;
      roleEl.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'ease-out' });
      roleEl.textContent = roles[index];
    }, 2600);
  }

  // Reveal elements as they enter the viewport.
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    $$('.reveal').forEach(el => observer.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('in-view'));
  }

  // Filter projects by topic.
  const filterButtons = $$('.filter-btn');
  const projectCards = $$('.project-card');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
    const filter = button.dataset.filter;
    projectCards.forEach((card, index) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.hidden = !show;
      if (show && !reduceMotion) {
        card.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, delay: index * 35, easing: 'ease-out' });
      }
    });
  }));

  // Certificate and patent image lightbox.
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightboxImage');
  const lightboxTitle = $('#lightboxTitle');
  const lightboxOpen = $('#lightboxOpen');
  $$('[data-image]').forEach(button => button.addEventListener('click', () => {
    const image = button.dataset.image;
    const title = button.dataset.title || 'Preview';
    lightboxImage.src = image;
    lightboxImage.alt = title;
    lightboxTitle.textContent = title;
    lightboxOpen.href = image;
    lightbox.showModal();
  }));
  $('#modalClose').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });

  // Project detail modals provide a fuller, carefully qualified project overview.
  const projectNotes = {
    documind: {
      title: 'DocuMind — Intelligent Document Organization Assistant',
      body: `<p><strong>Problem:</strong> Long PDFs can be difficult to navigate and convert into useful study material. DocuMind explores a workflow that makes documents easier to understand and revise.</p><h3>What it does</h3><ul><li>Accepts PDF documents and extracts their text for downstream processing.</li><li>Organizes document content into a more digestible analysis flow.</li><li>Uses an LLM-powered workflow to generate context-aware quiz questions from the source material.</li><li>Uses a Gradio interface as the user-facing prototype, with Langflow/LangGraph and Groq in the orchestration/model workflow.</li></ul><h3>Technical approach</h3><p><strong>Python · Gradio · Langflow · LangGraph · Groq.</strong> Redis caching and RabbitMQ/Celery background processing have been explored as supporting architecture; list them as implemented components only where the final runnable code confirms that integration.</p><h3>Next steps</h3><ul><li>Add source-grounded citations to answers and generated questions.</li><li>Test on different PDF layouts and document lengths.</li><li>Measure extraction quality, question relevance, latency, and failure cases.</li><li>Publish an architecture diagram, demo, and dedicated repository link.</li></ul>`
    },
    parkinson: {
      title: `Parkinson's Disease Prediction Using Voice Data`,
      body: `<p><strong>Problem:</strong> Explore whether voice-derived features contain useful patterns for a machine-learning prediction task, while keeping model decisions interpretable.</p><h3>Workflow explored</h3><ul><li>Prepare and inspect voice-feature data before model training.</li><li>Explore feature selection, including Recursive Feature Elimination (RFE), to investigate a compact feature set.</li><li>Investigate class-imbalance handling, including SVMSMOTE, where appropriate for the experimental split.</li><li>Compare approaches including Fuzzy K-Nearest Neighbors and tree-based models such as XGBoost.</li><li>Use SHAP to examine feature contributions and help interpret model behaviour.</li></ul><h3>Evaluation to report</h3><p>For a reproducible write-up, document the dataset citation, split strategy, preprocessing fitted only on training data, baseline comparison, class-wise precision/recall, F1, confusion matrix, and uncertainty. Avoid reporting a score unless it comes from the final evaluated run.</p><p><strong>Limitation:</strong> This is an experimental ML project, not a clinically validated diagnostic system and not a substitute for medical assessment.</p>`
    },
    climate: {
      title: 'Hybrid ANN–Random Forest Climate Forecasting',
      body: `<p><strong>Problem:</strong> Environmental forecasting can be affected by nonlinear relationships, seasonality, and shifts in weather or land-surface conditions. This project explores a hybrid modelling approach for climate-related prediction.</p><h3>Approach</h3><ul><li>Combine an Artificial Neural Network (ANN) with Random Forest in an experimental hybrid pipeline.</li><li>Prepare environmental predictors and engineer useful features.</li><li>Use time-aware training, validation, and held-out test splits to reduce leakage from future observations.</li><li>Evaluate regression predictions with metrics such as MAE, RMSE, R², and MAPE where the target and metric assumptions make them appropriate.</li><li>Inspect seasonal bias and investigate correction strategies rather than relying only on aggregate scores.</li></ul><h3>What to document</h3><p>For a research-ready case study, state the target variable, geographic coverage, date range, data sources, baseline models, split boundaries, metric definitions, and error patterns. Add numeric results only from the final reproducible experiment.</p><p><strong>Current framing:</strong> a forecasting experiment; the portfolio does not claim operational deployment or guaranteed forecast accuracy.</p>`
    },
    api: {
      title: 'Todo List REST API — Native Node.js',
      body: `<p><strong>Goal:</strong> understand what a backend framework normally abstracts by building a REST-style task API with native Node.js instead of Express.</p><h3>Core behaviour</h3><ul><li>Create an HTTP server and route requests using native Node.js APIs.</li><li>Handle task-oriented operations through HTTP methods such as GET and POST.</li><li>Represent task details such as priority and due date, and derive overdue status from dates.</li><li>Return appropriate status codes and JSON responses for supported requests.</li><li>Keep request handling and task logic explicit so the control flow is easy to study.</li></ul><h3>What this demonstrates</h3><p>Understanding of HTTP request/response cycles, routing, JSON parsing, status codes, and backend logic without depending on Express middleware.</p><h3>Next steps</h3><ul><li>Add robust input validation and consistent error responses.</li><li>Persist tasks in a database rather than relying on in-memory state, if that is how the current version is configured.</li><li>Add automated tests for routes, invalid input, and date edge cases.</li><li>Publish a route table and example request/response payloads.</li></ul>`
    },
    forensicai: {
      title: 'ForensicAI — Suspect Visualization using Latent Diffusion Models',
      body: `<p><strong>Research question:</strong> Can text-conditioned image-generation components be combined with visual-similarity tools to explore a forensic-style witness-description workflow?</p><h3>Pipeline explored</h3><ul><li><strong>Input:</strong> a natural-language description of observed facial characteristics.</li><li><strong>Generation:</strong> Stable Diffusion v1.5 with CLIP ViT-L/14 conditioning to produce a portrait concept and a forensic-style sketch concept.</li><li><strong>Representation:</strong> latent-diffusion processing rather than direct pixel-space generation.</li><li><strong>Similarity exploration:</strong> DeepFace with FaceNet512 and VGG-Face embeddings, compared using cosine similarity in the experimental setup.</li><li><strong>Interface:</strong> a Gradio-based prototype for exploring the workflow.</li></ul><h3>Reported experimental observations</h3><p>The project notes report FID 5.2, CLIP Score 0.31, human-rated realism of 4.1/5, and 100% classification accuracy at a calibrated 0.60 cosine-similarity threshold on the experimental dataset. These are project-reported results; they should be accompanied by dataset size, protocol, baseline, confidence intervals, and reproducible evaluation details before being treated as robust findings.</p><p>The project has been reported as accepted for presentation at ICACS 2026. This portfolio wording reflects the project information supplied by its author.</p><h3>Limitations and responsible use</h3><p>Generated faces can differ from the person described, and embedding similarity is not proof of identity. Dataset bias, false matches, image-generation artefacts, and threshold sensitivity require careful evaluation. This prototype is a research exploration only—not a validated forensic identification tool, and not a basis for accusing, identifying, or making legal decisions about a real person.</p><p><strong>Technologies:</strong> Python, PyTorch, Stable Diffusion v1.5, CLIP ViT-L/14, Hugging Face Diffusers, DeepFace, FaceNet512, VGG-Face, and Gradio.</p>`
    }
  };
  const projectModal = $('#projectModal');
  $$('.details-button').forEach(button => button.addEventListener('click', () => {
    const note = projectNotes[button.dataset.project];
    if (!note) return;
    $('#projectModalTitle').textContent = note.title;
    $('#projectModalBody').innerHTML = note.body;
    projectModal.showModal();
  }));
  $('#projectModalClose').addEventListener('click', () => projectModal.close());
  $('#projectModalDone').addEventListener('click', () => projectModal.close());
  projectModal.addEventListener('click', event => { if (event.target === projectModal) projectModal.close(); });

  // LinkedIn profile is linked directly in the hero and contact section.
  const LINKEDIN_URL = 'https://www.linkedin.com/in/arpita-waghmare-33a5a6314';
  if (LINKEDIN_URL && $('#linkedinLink')) {
    $('#linkedinLink').href = LINKEDIN_URL;
    if ($('#linkedinRow')) $('#linkedinRow').hidden = false;
  }
})();
