// Barre de progression
const readingProgressBar = document.getElementById('readingProgress');
if (readingProgressBar) {
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (docHeight > 0) ? (scrollPos / docHeight) * 100 : 0;
        readingProgressBar.style.width = progress + '%';
    });
}

// Bouton ScrollTop
const btnScrollTop = document.getElementById('btnScrollTop');
if (btnScrollTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btnScrollTop.style.display = 'block';
        } else {
            btnScrollTop.style.display = 'none';
        }
    });
    btnScrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Dark/Light Mode
const toggleDarkModeBtn = document.getElementById('toggleDarkMode');
if (toggleDarkModeBtn) {
    let darkMode = localStorage.getItem('darkMode');

    const enableDarkMode = () => {
        document.body.classList.add('dark-mode');
        toggleDarkModeBtn.textContent = 'Light Mode';
        toggleDarkModeBtn.setAttribute('aria-pressed', 'true');
        localStorage.setItem('darkMode', 'enabled');
    }

    const disableDarkMode = () => {
        document.body.classList.remove('dark-mode');
        toggleDarkModeBtn.textContent = 'Dark Mode';
        toggleDarkModeBtn.setAttribute('aria-pressed', 'false');
        localStorage.setItem('darkMode', 'disabled');
    }

    if (darkMode === 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }

    toggleDarkModeBtn.addEventListener('click', () => {
        darkMode = localStorage.getItem('darkMode');
        if (darkMode !== 'enabled') {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    });
    if (localStorage.getItem('darkMode') === null) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !document.body.classList.contains('dark-mode')) {
             enableDarkMode();
        } else if (!document.body.classList.contains('dark-mode')) {
             disableDarkMode();
        }
    }
}


// Boutons "Copier" code
const copyButtons = document.querySelectorAll('.copy-btn');
const srFeedback = document.getElementById('sr-feedback');

copyButtons.forEach((btn) => {
	if (!btn.hasAttribute('aria-label')) {
		// Try to get a more descriptive label from a potential preceding h3 or h2
        let label = 'Copier le bloc de code';
        const preParent = btn.closest('pre');
        if (preParent) {
            let sibling = preParent.previousElementSibling;
            while(sibling) {
                if (sibling.tagName.match(/^H[2-6]$/)) {
                    label = `Copier le bloc de code pour "${sibling.textContent.trim().substring(0,30)}..."`;
                    break;
                }
                sibling = sibling.previousElementSibling;
            }
        }
		btn.setAttribute('aria-label', label);
	}
	btn.addEventListener('click', () => {
        let actualCodeBlock = null;
        const parentPre = btn.closest('pre');
        if (parentPre) {
            actualCodeBlock = parentPre.querySelector('code');
        }

		if (actualCodeBlock) {
			const textToCopy = actualCodeBlock.innerText;
			navigator.clipboard.writeText(textToCopy)
				.then(() => {
					const originalText = btn.textContent;
					btn.textContent = 'Copié !';
					if (srFeedback) srFeedback.textContent = 'Code copié dans le presse-papiers !';
					setTimeout(() => {
						btn.textContent = 'Copier';
						if (srFeedback) srFeedback.textContent = '';
					}, 2000);
				})
				.catch((err) => {
					console.error('Échec de la copie :', err);
					if (srFeedback) srFeedback.textContent = 'Échec de la copie du code.';
                    setTimeout(() => {
                        if (srFeedback) srFeedback.textContent = '';
                    }, 3000);
				});
		} else {
            console.error("Bloc de code non trouvé pour le bouton copier.", btn);
        }
	});
});

// Recherche code
const searchInput = document.getElementById('searchBar');
if (searchInput) {
	searchInput.addEventListener('input', () => {
		const query = searchInput.value.toLowerCase();
		const allPreElements = document.querySelectorAll('pre');

		allPreElements.forEach(preElement => {
			const codeEl = preElement.querySelector('code');

			if (codeEl) {
				const codeText = codeEl.innerText.toLowerCase();
				if (codeText.includes(query)) {
					preElement.classList.remove('hiddenBySearch');
				} else {
					preElement.classList.add('hiddenBySearch');
				}
			}
		});
	});
} else {
	console.error("L'élément de la barre de recherche ('searchBar') n'a pas été trouvé.");
}

// Hamburger Menu
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navbarTOCEl = document.getElementById('navbarTOC');
if (hamburgerBtn && navbarTOCEl) {
    hamburgerBtn.addEventListener('click', () => {
        const isOpen = navbarTOCEl.classList.toggle('open');
        hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
        document.body.classList.toggle('mobile-toc-open');
    });
} else {
    if(!hamburgerBtn && navbarTOCEl) console.error("#hamburgerBtn non trouvé pour le menu mobile.");
    if(!navbarTOCEl && hamburgerBtn) console.error("#navbarTOC non trouvé pour le menu mobile.");
}

// TOC Active Link Highlighting & Scrolling
const tocLinks = document.querySelectorAll('#navbarTOC a');
const contentSections = document.querySelectorAll('div.contentWithToc section[id]');

function changeActiveTocLink() {
	let currentSectionId = '';
	const offset = window.innerHeight * 0.2;

	contentSections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        // Check if the section is within the "activation zone" (near the top 20% of viewport)
		if (window.scrollY + offset >= sectionTop && window.scrollY + offset < sectionBottom) {
			currentSectionId = section.id;
		}
	});

    if (!currentSectionId && contentSections.length > 0) {
        // Fallback: if no section is in the "activation zone", find the topmost section currently visible
        for (let i = 0; i < contentSections.length; i++) {
            if (contentSections[i].offsetTop + contentSections[i].offsetHeight > window.scrollY + 50 ) { // 50px buffer from top
                currentSectionId = contentSections[i].id;
                break;
            }
        }
        // If still no currentSectionId (e.g. scrolled to the very bottom past all sections),
        // select the last section.
        if (!currentSectionId) {
            currentSectionId = contentSections[contentSections.length - 1].id;
        }
    }


	tocLinks.forEach((link) => {
		link.classList.remove('active-toc-link');
		link.removeAttribute('aria-current');
		const linkHref = link.getAttribute('href');

		if (linkHref && currentSectionId && linkHref.substring(1) === currentSectionId) {
			link.classList.add('active-toc-link');
			link.setAttribute('aria-current', 'page');

			const tocNav = document.getElementById('navbarTOC');
			if (tocNav && tocNav.contains(link)) {
				const linkRect = link.getBoundingClientRect();
				const tocRect = tocNav.getBoundingClientRect();

				const isVisible = (
					linkRect.top >= tocRect.top &&
					linkRect.bottom <= tocRect.bottom
				);

				if (!isVisible) {
					// Using 'auto' for behavior as 'smooth' can be slow with frequent scroll events
					link.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
				}
			}
		}
	});
}

if (contentSections.length > 0 && tocLinks.length > 0) {
    changeActiveTocLink();
    window.addEventListener('scroll', changeActiveTocLink);
    window.addEventListener('resize', changeActiveTocLink);
} else {
    if (contentSections.length === 0 && document.body.classList.contains('contentWithToc')) console.error("Aucune section de contenu avec ID trouvée pour le highlighting de la TOC.");
    if (tocLinks.length === 0 && document.getElementById('navbarTOC')) console.error("Aucun lien TOC trouvé pour le highlighting.");
}

// Initialiser le bouton Dark Mode si aucune préférence n'est sauvegardée
if (toggleDarkModeBtn && localStorage.getItem('darkMode') === null) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}
// S'assurer que les ARIA attributes sont corrects au chargement pour le bouton dark mode
if(toggleDarkModeBtn) {
    toggleDarkModeBtn.setAttribute('aria-pressed', document.body.classList.contains('dark-mode').toString());
}
// S'assurer que les ARIA attributes sont corrects au chargement pour le hamburger
if(hamburgerBtn && navbarTOCEl) {
    hamburgerBtn.setAttribute('aria-expanded', navbarTOCEl.classList.contains('open').toString());
}
