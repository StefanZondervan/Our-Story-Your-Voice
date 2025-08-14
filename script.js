document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "AIzaSyAgYMuTM1vmJdA_KqMFlhiUc6xVRsTlOSU",
        authDomain: "collective-heritage.firebaseapp.com",
        projectId: "collective-heritage",
        storageBucket: "collective-heritage.appspot.com",
        messagingSenderId: "247348908975",
        appId: "1:247348908975:web:7cbce710a2bbbe3980d55a",
        measurementId: "G-NB2B0817XF"
    };

    // Initialize Firebase and its services
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const storage = firebase.storage();

    // --- Global Selectors ---
    const navItems = document.querySelectorAll('.nav-item');
    const navCircleLine = document.querySelector('.nav-circle-line');
    const leftSectionContents = document.querySelectorAll('.left-panel-top .section-content');
    const rightPanel = document.querySelector('.right-panel');
    let selectedTitleDisplay = document.createElement('div');
    selectedTitleDisplay.classList.add('selected-title');
    navCircleLine.appendChild(selectedTitleDisplay);
    const initialTitle = selectedTitleDisplay.textContent;

    // --- Right Panel Content Selectors ---
    const rightPanelCategoryContents = document.querySelectorAll('.right-panel-category-content');
    const allRightPanelDots = document.querySelectorAll('.right-panel-dots .dot');
    const collectiveContentPanel = document.querySelector('[data-right-content="Collective"]');
    const collectiveStoryViewer = document.getElementById('collective-story-viewer');
    const collectiveStoriesList = document.getElementById('collective-stories-list');
    const rightBottomContent = document.querySelector('.right-bottom-content');
    const rightUpperContainer = document.querySelector('.right-upper-container');

    // --- SVG Selectors ---
    const backgroundSVG = document.querySelector('svg');
    const svgTangibleGroup = document.getElementById('SvgTangible');
    const svgIntangibleGroup = document.getElementById('SvgIntangible');
    const svgMentalGroup = document.getElementById('SvgMental');
    const allSvgGroups = [svgTangibleGroup, svgIntangibleGroup, svgMentalGroup];
    const allSvgDots = document.querySelectorAll('g[id^="svg-dot-"]');

    const svgDotGroups = {
        institutional: document.getElementById('Institutional_Dots'),
        tangible: document.getElementById('Tangible_Dots'),
        intangible: document.getElementById('Intangible_Dots'),
        mental: document.getElementById('Mental_Dots'),
        collective: document.getElementById('Collective_Dots')
    };

    // --- SVG ViewBox Configuration ---
    const initialViewBox = "0 0 1792 1115.26";
    const zoomTargets = {
        'introduction': initialViewBox,
        'institutional': initialViewBox,
        'tangible': initialViewBox,
        'intangible': initialViewBox,
        'mental': initialViewBox,
        'collective': initialViewBox,
    };
    const animationDuration = 800;

    const rightPanelSectionToPatternId = {
        'Maritime': 'pattern-maritime',
        'Tax': 'pattern-tax',
        'Port': 'pattern-port',
        'Portlantis': 'pattern-portlantis',
        'FutureLand': 'pattern-futureLand',
        'Stadsarchief': 'pattern-stadsarchief',
        'Tangible-A': 'pattern-tangible-a',
        'Tangible-B': 'pattern-tangible-b',
        'Tangible-C': 'pattern-tangible-c',
        'Tangible-D': 'pattern-tangible-d',
        'Tangible-E': 'pattern-tangible-e',
        'Intangible-A': 'pattern-intangible-a',
        'Intangible-B': 'pattern-intangible-b',
        'Intangible-C': 'pattern-intangible-c',
        'Intangible-D': 'pattern-intangible-d',
        'Mental-A': 'pattern-mental-a',
        'Mental-B': 'pattern-mental-b',
        'Mental-C': 'pattern-mental-c'
    };

    const initialSections = {
        'Introduction': null,
        'Institutional': 'Maritime',
        'Tangible': 'Tangible-A',
        'Intangible': 'Intangible-A',
        'Mental': 'Mental-A',
        'Collective': null
    };

    // --- Collective Functionality Selectors and Variables ---
    const middlePanel = document.querySelector('.middle-panel');
    const addDotButton = document.getElementById('add-dot-button');
    const addPanelModal = document.getElementById('add-panel-modal');
    const closeButton = addPanelModal.querySelector('.close-button');
    const collectiveStoryForm = document.getElementById('collective-story-form');
    const userDotsContainer = document.querySelector('.user-dots-container');
    const collectivePrompt = document.querySelector('.collective-prompt');
    let activeSection = '';
    let stories = [];
    
    // --- UI Elements for Feedback ---
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    document.body.appendChild(loadingSpinner);

    const messageBox = document.createElement('div');
    messageBox.classList.add('message-box');
    document.body.appendChild(messageBox);

    function showMessage(message, type = 'info') {
        if (type === 'success') {
            console.log(`Success message blocked: ${message}`);
            return;
        }

        messageBox.textContent = message;
        messageBox.className = 'message-box';
        messageBox.classList.add(type);
        messageBox.classList.add('visible');
        setTimeout(() => {
            messageBox.classList.remove('visible');
        }, 5000);
    }
    
    function showSpinner() {
        loadingSpinner.classList.add('visible');
    }

    function hideSpinner() {
        loadingSpinner.classList.remove('visible');
    }

    // --- Functions ---
    function showRightPanelCategoryContent(categoryName) {
        rightPanelCategoryContents.forEach(content => {
            content.classList.toggle('active', content.dataset.rightContent === categoryName);
        });
    }

    function updateRightPanel(category, dotTargetSection) {
        const categoryContainer = document.querySelector(`[data-right-content="${category}"]`);
        if (!categoryContainer) return;

        const dots = categoryContainer.querySelectorAll('.right-panel-dots .dot');
        dots.forEach(dot => {
            dot.classList.toggle('active', dot.dataset.targetSection === dotTargetSection);
        });

        const contentItems = categoryContainer.querySelectorAll('.right-section-item');
        contentItems.forEach(item => {
            item.classList.toggle('active-content', item.dataset.section === dotTargetSection);
        });

        if (category === 'Mental') {
            setSvgMentalFill(dotTargetSection);
        } else {
            // This now handles Institutional, Tangible, and Intangible
            setSvgTangibleFill(dotTargetSection);
        }
        highlightSvgDot(dotTargetSection);
    }

    function showLeftPanelSection(sectionName) {
        leftSectionContents.forEach(content => {
            content.style.display = (content.dataset.section === sectionName) ? 'block' : 'none';
        });
    }

    function controlRightPanelContainerVisibility(sectionName) {
        rightPanel.classList.toggle('hidden', sectionName === 'Introduction');
    }

    function showMainSvgGroup(sectionName) {
        allSvgGroups.forEach(group => {
            if (group) group.style.display = 'none';
        });

        if (['Introduction', 'Institutional', 'Tangible', 'Intangible'].includes(sectionName)) {
            if (svgTangibleGroup) svgTangibleGroup.style.display = 'block';
        } else if (sectionName === 'Mental') {
            if (svgMentalGroup) svgMentalGroup.style.display = 'block';
        }
    }

    function showSvgDotGroup(sectionName) {
        for (const key in svgDotGroups) {
            if (svgDotGroups[key]) svgDotGroups[key].style.display = 'none';
        }
        const targetGroup = svgDotGroups[sectionName.toLowerCase()];
        if (targetGroup) targetGroup.style.display = 'block';
    }

    function animateViewBox(targetViewBoxString, duration) {
        if (!backgroundSVG) {
            console.error("SVG element not found for viewBox animation.");
            return;
        }
        const startViewBox = backgroundSVG.getAttribute('viewBox').split(' ').map(Number);
        const endViewBox = targetViewBoxString.split(' ').map(Number);

        const startTime = performance.now();
        function updateViewBox(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentViewBox = startViewBox.map((startVal, i) => startVal + (endViewBox[i] - startVal) * progress);
            backgroundSVG.setAttribute('viewBox', currentViewBox.join(' '));
            if (progress < 1) requestAnimationFrame(updateViewBox);
        }
        requestAnimationFrame(updateViewBox);
    }

    function setSvgTangibleFill(rightSection) {
        if (!svgTangibleGroup) return;

        if (rightSection && rightPanelSectionToPatternId[rightSection]) {
            const patternId = rightPanelSectionToPatternId[rightSection];
            svgTangibleGroup.setAttribute('fill', `url(#${patternId})`);
        } else {
            svgTangibleGroup.setAttribute('fill', '#ef4034');
        }
    }
    
    function setSvgMentalFill(rightSection) {
        if (!svgMentalGroup) return;

        if (rightSection && rightPanelSectionToPatternId[rightSection]) {
            const patternId = rightPanelSectionToPatternId[rightSection];
            svgMentalGroup.setAttribute('fill', `url(#${patternId})`);
        } else {
            svgMentalGroup.setAttribute('fill', 'none');
        }
    }

    function highlightSvgDot(targetSection) {
        allSvgDots.forEach(dotGroup => {
            const pulseCircle = dotGroup.querySelector('.cls-3');
            if (pulseCircle) pulseCircle.classList.remove('svg-dot-pulse');
        });
        const svgDotGroup = document.getElementById(`svg-dot-${targetSection}`);
        if (svgDotGroup) {
            const pulseCircle = svgDotGroup.querySelector('.cls-3');
            if (pulseCircle) pulseCircle.classList.add('svg-dot-pulse');
        }
    }

    // NEW: Central heritage dot position
    let centralHeritagePosition = {};

    function getRandomPosition() {
        const angle = Math.random() * 2 * Math.PI;
        const radius = 50 + Math.random() * 100; // Radius between 50 and 150px
        const x = centralHeritagePosition.x + radius * Math.cos(angle);
        const y = centralHeritagePosition.y + radius * Math.sin(angle);
        return { x, y };
    }
    
    async function saveStory(event) {
        event.preventDefault();
        showSpinner();

        const formData = new FormData(collectiveStoryForm);
        const tag = formData.get('story-tag');
        
        if (!tag) {
            showMessage('Invalid tag selected.', 'error');
            hideSpinner();
            return;
        }

        const newDotPosition = getRandomPosition();

        const storyData = {
            title: formData.get('story-title'),
            name: formData.get('story-name'),
            text: formData.get('story-text'),
            tag: tag,
            position: newDotPosition,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('collectiveStories').add(storyData);
            addPanelModal.classList.remove('visible');
            collectiveStoryForm.reset();
            collectivePrompt.classList.add('active');

        } catch (error) {
            console.error("Error saving story:", error);
            showMessage('Failed to save the story. Check the console for details.', 'error');
        } finally {
            hideSpinner();
        }
    }
    
    function createDot(story) {
        const newDot = document.createElement('div');
        newDot.classList.add('user-dot');
        newDot.classList.add(story.tag);
        newDot.dataset.storyId = story.id;
        newDot.style.left = `${story.position.x}px`;
        newDot.style.top = `${story.position.y}px`;
        
        if (!newDot.dataset.listenerAdded) {
            newDot.addEventListener('click', () => {
                selectStory(story.id);
            });
            newDot.dataset.listenerAdded = 'true';
        }
        
        userDotsContainer.appendChild(newDot);
    }

    function createHeritageDots() {
        userDotsContainer.querySelectorAll('.heritage-dot, .heritage-dot-title').forEach(el => el.remove());

        const middlePanelWidth = middlePanel.offsetWidth;
        const middlePanelHeight = middlePanel.offsetHeight;

        centralHeritagePosition = {
            x: middlePanelWidth / 2,
            y: middlePanelHeight / 2
        };

        const dot = document.createElement('div');
        dot.classList.add('heritage-dot', 'Collective');
        dot.dataset.tag = 'Collective';
        dot.style.left = `${centralHeritagePosition.x}px`;
        dot.style.top = `${centralHeritagePosition.y}px`;
        userDotsContainer.appendChild(dot);

        const title = document.createElement('div');
        title.classList.add('heritage-dot-title');
        title.textContent = 'Collective Heritage';
        title.style.left = `${centralHeritagePosition.x}px`;
        title.style.top = `${centralHeritagePosition.y + 25}px`; 
        userDotsContainer.appendChild(title);

        const lastStory = stories[0];
        if (lastStory) {
            updateCentralDotColor(lastStory.tag);
        } else {
            updateCentralDotColor('Collective');
        }
    }
    
    function updateCentralDotColor(tag) {
        const centralDot = userDotsContainer.querySelector('.heritage-dot.Collective');
        if (centralDot) {
            centralDot.classList.remove('Tangible', 'Intangible', 'Mental');
            centralDot.classList.add(tag);
        }
    }

    function drawConnections() {
        document.querySelectorAll('.connection-line').forEach(line => line.remove());
        
        const centralDot = userDotsContainer.querySelector('.heritage-dot.Collective');
        if (!centralDot) return;

        const userDots = userDotsContainer.querySelectorAll('.user-dot');
        
        const endX = parseFloat(centralDot.style.left);
        const endY = parseFloat(centralDot.style.top);

        userDots.forEach(userDot => {
            const startX = parseFloat(userDot.style.left);
            const startY = parseFloat(userDot.style.top);
            
            const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;

            const line = document.createElement('div');
            line.classList.add('connection-line');
            line.style.left = `${startX}px`;
            line.style.top = `${startY}px`;
            line.style.width = `${length}px`;
            line.style.transform = `rotate(${angle}deg)`;

            userDotsContainer.appendChild(line);
        });
    }

    function appendStoryToRightPanel(story) {
        const cardDiv = document.createElement('div');
        cardDiv.classList.add('collective-story-card');
        cardDiv.dataset.storyId = story.id;
        cardDiv.innerHTML = `
            <h4>${story.title}</h4>
            ${story.name ? `<p>by ${story.name}</p>` : ''}
            <p><small>Tag: ${story.tag}</small></p>
        `;

        if (!cardDiv.dataset.listenerAdded) {
            cardDiv.addEventListener('click', () => {
                selectStory(story.id);
            });
            cardDiv.dataset.listenerAdded = 'true';
        }

        collectiveStoriesList.appendChild(cardDiv);
    }

    function displaySelectedStory(story) {
        if (!story) {
            collectiveStoryViewer.innerHTML = `<p>Select a story from the list below to view its full content.</p>`;
            return;
        }

        collectiveStoryViewer.innerHTML = `
            <h3>${story.title}</h3>
            ${story.name ? `<p><strong>By:</strong> ${story.name}</p>` : ''}
            <p>${story.text}</p>
            <p><small><strong>Tag:</strong> ${story.tag}</small></p>
        `;
    }

    function selectStory(storyId) {
        const selectedStory = stories.find(story => story.id === storyId);
        if (!selectedStory) {
            console.error("Story not found for ID:", storyId);
            return;
        }

        displaySelectedStory(selectedStory);
        
        const allCards = document.querySelectorAll('.collective-story-card');
        allCards.forEach(card => card.classList.remove('active'));

        const allUserDots = userDotsContainer.querySelectorAll('.user-dot');
        allUserDots.forEach(dot => {
            dot.classList.remove('active');
            dot.classList.remove('user-dot-pulse');
        });

        const targetCard = collectiveStoriesList.querySelector(`[data-story-id="${storyId}"]`);
        if (targetCard) {
            targetCard.classList.add('active');
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        const targetDot = userDotsContainer.querySelector(`[data-story-id="${storyId}"]`);
        if (targetDot) {
            targetDot.classList.add('active');
            targetDot.classList.add('user-dot-pulse');
        }
    }

    db.collection('collectiveStories').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        stories = [];
        userDotsContainer.querySelectorAll('.user-dot').forEach(dot => dot.remove());
        collectiveStoriesList.innerHTML = '';
        document.querySelectorAll('.connection-line').forEach(line => line.remove());

        snapshot.forEach(doc => {
            const story = {
                id: doc.id,
                ...doc.data()
            };
            stories.push(story);
            appendStoryToRightPanel(story);
            createDot(story);
        });

        createHeritageDots();
        drawConnections();

        if (stories.length > 0) {
            const activeStoryId = document.querySelector('.collective-story-card.active')?.dataset.storyId;
            if (!activeStoryId) {
                displaySelectedStory(stories[0]);
                selectStory(stories[0].id);
            }
        } else {
            displaySelectedStory(null);
        }
    });

    // --- Initial State Setup (On Page Load) ---
    let currentUnlockedIndex = 0;
    const maxIndex = navItems.length - 1;

    function initializePage() {
        const initialLeftSection = 'Introduction';
        showLeftPanelSection(initialLeftSection);
        controlRightPanelContainerVisibility(initialLeftSection);
        showRightPanelCategoryContent(initialLeftSection);
        selectedTitleDisplay.textContent = 'Introduction';
        navItems.forEach(item => {
            item.classList.remove('active', 'unlocked-step', 'next-step');
        });

        if (navItems.length > 0) {
            navItems[0].classList.add('active');
            navItems[0].classList.add('unlocked-step');
        }
        
        if (navItems.length > 1) {
             navItems[1].classList.add('unlocked-step');
        }

        updateNextStepHighlight();

        addDotButton.style.display = 'none';
        userDotsContainer.style.display = 'none';
        rightBottomContent.style.display = 'none';
        collectivePrompt.classList.remove('active');
        if (collectiveContentPanel) {
            collectiveContentPanel.style.display = 'none';
        }

        setSvgTangibleFill(null);
        showMainSvgGroup(initialLeftSection);
        showSvgDotGroup(initialLeftSection);
        backgroundSVG.setAttribute('viewBox', initialViewBox);
    }
    
    initializePage();

    // --- Event Listeners and Progressive Unlocking Logic ---
    navItems.forEach((item, index) => {
        item.dataset.index = index;
    });

    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const clickedIndex = parseInt(event.currentTarget.dataset.index);

            if (clickedIndex > currentUnlockedIndex + 1 && currentUnlockedIndex !== maxIndex) {
                return;
            }

            const sectionToShow = event.currentTarget.dataset.section;
            const titleToDisplay = event.currentTarget.dataset.title;
            activeSection = sectionToShow;

            const originalTitle = selectedTitleDisplay.textContent;
            
            selectedTitleDisplay.textContent = titleToDisplay;
            showLeftPanelSection(sectionToShow);

            if (sectionToShow === 'Collective') {
                collectivePrompt.classList.add('active');
                rightPanel.classList.remove('hidden');
                addDotButton.style.display = 'block';
                userDotsContainer.style.display = 'block';
                rightBottomContent.style.display = 'flex';
                rightUpperContainer.classList.add('collective-style');
                rightBottomContent.classList.add('collective-style');
                displaySelectedStory(null);
                collectiveContentPanel.style.display = 'flex';
                showRightPanelCategoryContent('Collective');
                createHeritageDots();
                drawConnections();
            } else {
                collectivePrompt.classList.remove('active');
                controlRightPanelContainerVisibility(sectionToShow);
                addDotButton.style.display = 'none';
                userDotsContainer.style.display = 'none';
                rightBottomContent.style.display = 'none';
                rightUpperContainer.classList.remove('collective-style');
                rightBottomContent.classList.remove('collective-style');
                if (collectiveContentPanel) {
                    collectiveContentPanel.style.display = 'none';
                }
                showRightPanelCategoryContent(sectionToShow);
            }

            showMainSvgGroup(sectionToShow);
            showSvgDotGroup(sectionToShow);
            const newViewBox = zoomTargets[sectionToShow.toLowerCase()] || initialViewBox;
            animateViewBox(newViewBox, animationDuration);

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const initialSubSection = initialSections[sectionToShow];
            if (initialSubSection) {
                updateRightPanel(sectionToShow, initialSubSection);
            } else {
                setSvgTangibleFill(null);
                highlightSvgDot(null);
            }

            if (clickedIndex > currentUnlockedIndex) {
                currentUnlockedIndex = clickedIndex;
            }

            if (currentUnlockedIndex < maxIndex) {
                navItems[currentUnlockedIndex + 1].classList.add('unlocked-step');
            }

            if (currentUnlockedIndex === maxIndex) {
                navCircleLine.classList.add('unlocked');
                navItems.forEach(nav => nav.classList.add('unlocked-step'));
            }

            updateNextStepHighlight();
        });
    });

    navItems.forEach(item => {
        item.addEventListener('mouseenter', (event) => {
            const itemElement = event.currentTarget;
            const index = parseInt(itemElement.dataset.index);
            const isActive = itemElement.classList.contains('active');
            const isUnlocked = itemElement.classList.contains('unlocked-step');
            const isNextStep = itemElement.classList.contains('next-step');

            if (isUnlocked && !isActive) {
                selectedTitleDisplay.textContent = itemElement.dataset.title;
            }

            if (isNextStep) {
                itemElement.style.animation = 'none';
            }
        });

        item.addEventListener('mouseleave', (event) => {
            const itemElement = event.currentTarget;
            const isNextStep = itemElement.classList.contains('next-step');
            
            const activeItem = document.querySelector('.nav-item.active');
            if (activeItem) {
                selectedTitleDisplay.textContent = activeItem.dataset.title;
            }

            if (isNextStep) {
                itemElement.style.animation = '';
            }
        });
    });

    function updateNextStepHighlight() {
        navItems.forEach(item => item.classList.remove('next-step'));
        if (currentUnlockedIndex < maxIndex) {
            navItems[currentUnlockedIndex + 1].classList.add('next-step');
        }
    }

    allRightPanelDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const dotTargetSection = dot.dataset.targetSection;
            const currentCategory = dot.closest('.right-panel-category-content').dataset.rightContent;
            updateRightPanel(currentCategory, dotTargetSection);
        });
    });
    
    addDotButton.addEventListener('click', () => {
        addPanelModal.classList.add('visible');
        collectivePrompt.classList.remove('active');
    });

    closeButton.addEventListener('click', () => {
        addPanelModal.classList.remove('visible');
        collectiveStoryForm.reset();

        if(activeSection === 'Collective') {
            collectivePrompt.classList.add('active');
        }
    });

    collectiveStoryForm.addEventListener('submit', saveStory);
});