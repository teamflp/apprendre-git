// Barre de progression
const readingProgressBar = document.getElementById('readingProgress');
window.addEventListener('scroll', () => {
	const scrollPos = window.scrollY;
	const docHeight = document.documentElement.scrollHeight - window.innerHeight;
	const progress = (scrollPos / docHeight) * 100;
	readingProgressBar.style.width = progress + '%';
});

// Bouton ScrollTop
const btnScrollTop = document.getElementById('btnScrollTop');
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

// Dark/Light
const toggleDarkModeBtn = document.getElementById('toggleDarkMode');
let darkMode = localStorage.getItem('darkMode');

// Function to enable dark mode
const enableDarkMode = () => {
	document.body.classList.add('dark-mode');
	toggleDarkModeBtn.textContent = 'Light Mode';
	toggleDarkModeBtn.setAttribute('aria-pressed', 'true');
	localStorage.setItem('darkMode', 'enabled');
}

// Function to disable dark mode
const disableDarkMode = () => {
	document.body.classList.remove('dark-mode');
	toggleDarkModeBtn.textContent = 'Dark Mode';
	toggleDarkModeBtn.setAttribute('aria-pressed', 'false');
	localStorage.setItem('darkMode', 'disabled');
}

// Check local storage on page load
if (darkMode === 'enabled') {
	enableDarkMode();
} else {
    // Default to light mode if no preference or preference is 'disabled'
    disableDarkMode();
}

// Event listener for the toggle button
toggleDarkModeBtn.addEventListener('click', () => {
	// Re-check local storage in case it was changed in another tab (though less likely for localStorage)
	darkMode = localStorage.getItem('darkMode');
	if (darkMode !== 'enabled') {
		enableDarkMode();
	} else {
		disableDarkMode();
	}
});

// Boutons "Copier" code
const copyButtons = document.querySelectorAll('.copy-btn');
const srFeedback = document.getElementById('sr-feedback'); // For screen reader announcements

copyButtons.forEach((btn) => {
	if (!btn.hasAttribute('aria-label')) {
		// Fallback, ideally the aria-label is set in the HTML for each button individually.
		// This generic one is better than nothing.
		btn.setAttribute('aria-label', 'Copier le bloc de code suivant');
	}
	btn.addEventListener('click', () => {
		const codeBlock = btn.nextElementSibling;
		if (codeBlock && codeBlock.tagName.toLowerCase() === 'code') {
			const textToCopy = codeBlock.innerText;
			navigator.clipboard.writeText(textToCopy)
				.then(() => {
					btn.textContent = 'Copié !';
					if (srFeedback) srFeedback.textContent = 'Code copié dans le presse-papiers !';
					setTimeout(() => {
						btn.textContent = 'Copier';
						if (srFeedback) srFeedback.textContent = ''; // Clear announcement
					}, 1500);
				})
				.catch((err) => {
					console.error('Échec de la copie :', err);
					if (srFeedback) srFeedback.textContent = 'Échec de la copie du code.';
                    setTimeout(() => {
                        if (srFeedback) srFeedback.textContent = ''; // Clear announcement
                    }, 3000);
				});
		}
	});
});

// Recherche code
const searchInput = document.getElementById('searchBar');

if (searchInput) {
	searchInput.addEventListener('input', () => {
		const query = searchInput.value.toLowerCase();
		// On cible tous les éléments <pre> qui contiennent des blocs de code.
		// C'est l'élément <pre> entier que nous voulons masquer/afficher.
		const allPreElements = document.querySelectorAll('pre');

		allPreElements.forEach(preElement => {
			// On cherche un élément <code> à l'intérieur de ce <pre>
			const codeEl = preElement.querySelector('code');

			if (codeEl) { // Si un élément <code> existe dans ce <pre>
				const codeText = codeEl.innerText.toLowerCase();
				if (codeText.includes(query)) {
					preElement.classList.remove('hiddenBySearch');
				} else {
					preElement.classList.add('hiddenBySearch');
				}
			} else {
				// Si un <pre> n'a pas de <code> (peu probable pour ce document, mais bonne pratique)
				// on pourrait choisir de le cacher ou de le laisser visible.
				// Pour ce cas, laissons le visible s'il ne contient pas de code à filtrer.
				// Ou, si tous les <pre> sont censés avoir du code, on pourrait aussi le cacher.
				// Pour l'instant, ne faisons rien pour les <pre> sans <code>.
			}
		});
	});
} else {
	console.error("L'élément de la barre de recherche ('searchBar') n'a pas été trouvé.");
}


// Hamburger
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navbarTOC = document.getElementById('navbarTOC'); // Already declared for hamburger
hamburgerBtn.addEventListener('click', () => {
	const isOpen = navbarTOC.classList.toggle('open');
	hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
	document.body.classList.toggle('mobile-toc-open'); // Toggle body scroll lock
});

// TOC Active Link Highlighting
const tocLinks = document.querySelectorAll('#navbarTOC a');
const sections = document.querySelectorAll('section[id]'); // Ensure sections have IDs

function changeActiveTocLink() {
	let currentSectionId = '';
	const scrollPosition = window.scrollY + 100; // Offset to ensure the section is well in view

	sections.forEach(section => {
		if (section.offsetTop <= scrollPosition) {
			currentSectionId = section.id;
		}
	});

	tocLinks.forEach((link) => {
		link.classList.remove('active-toc-link');
		link.removeAttribute('aria-current');
		const linkHref = link.getAttribute('href');
		if (linkHref && currentSectionId && linkHref.substring(1) === currentSectionId) {
			link.classList.add('active-toc-link');
			link.setAttribute('aria-current', 'page');

			// Check if the active link is visible in the TOC, scroll if not
			const tocNav = document.getElementById('navbarTOC'); // Get the TOC container
			if (tocNav) {
				const linkRect = link.getBoundingClientRect();
				const tocRect = tocNav.getBoundingClientRect();

				if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
					link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
				}
			}
		}
	});
}


// Initial call to set active link on page load (if not at top)
if (window.scrollY > 0) {
	changeActiveTocLink();
}
// Add scroll event listener for TOC highlighting
window.addEventListener('scroll', changeActiveTocLink);
