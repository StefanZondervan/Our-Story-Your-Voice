document.addEventListener('DOMContentLoaded', () => {
    // Select the button that opens the modal
    const heritageCta = document.getElementById('heritage-cta');
    
    // Select the modal backdrop
    const modalBackdrop = document.querySelector('.modal-backdrop');

    // Add a click event listener to the "HERITAGE" button
    heritageCta.addEventListener('click', (event) => {
        // Prevent the default link behavior (navigating to a new page)
        event.preventDefault();
        
        // Show the modal by removing the 'hidden' class
        modalBackdrop.classList.remove('hidden');
    });

    // You can add a listener to hide the modal if the user clicks outside of it
    modalBackdrop.addEventListener('click', (event) => {
        // If the click is directly on the backdrop, hide the modal
        if (event.target === modalBackdrop) {
            modalBackdrop.classList.add('hidden');
        }
    });

});