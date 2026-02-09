document.addEventListener('DOMContentLoaded', () => {

    // --- Hero Carousel Logic ---
    const heroTrack = document.getElementById('heroTrack');
    // Convert NodeList to Array to manipulate
    let heroSlides = Array.from(document.querySelectorAll('.hero-slide'));

    if (heroSlides.length > 0) {
        const heroInterval = 5000; // 5 seconds (User requested fix for "not changing")

        // Function to shuffle array (Fisher-Yates)
        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Shuffle slides initially (keep first one active if possible, or just shuffle all and reset active)
        // To ensure random start, we shuffle and then ensure one is active.
        shuffle(heroSlides);

        // Clear current DOM elements and re-append in random order
        heroTrack.innerHTML = '';
        heroSlides.forEach((slide, index) => {
            slide.classList.remove('active'); // Reset all
            if (index === 0) slide.classList.add('active'); // Set first as active
            heroTrack.appendChild(slide);
        });

        // Re-query valid slides in new order
        heroSlides = document.querySelectorAll('.hero-slide');
        let currentHeroSlide = 0;

        function nextHeroSlide() {
            // Remove active class from current
            heroSlides[currentHeroSlide].classList.remove('active');

            // Move to next
            currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;

            // Add active class to new
            heroSlides[currentHeroSlide].classList.add('active');
        }

        setInterval(nextHeroSlide, heroInterval);
    }

    // --- Presentation Slideshow Logic ---
    const slidesWrapper = document.getElementById('slidesWrapper');

    // iPad App Link Logic (Optional: Any additional behavior for links if needed, otherwise empty)
    // The links are now handled via standard <a> tags with target="_blank"

    if (slidesWrapper) {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        // Configuration
        const totalSlides = 15; // Confirmed file count
        let currentSlide = 0;

        // Initialize Slides
        for (let i = 1; i <= totalSlides; i++) {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide';

            const img = document.createElement('img');
            img.src = `slides/slide_${i}.png`;
            img.alt = `Slide ${i}`;
            // Lazy load images that are not immediately visible
            if (i > 1) {
                img.loading = "lazy";
            }

            slideDiv.appendChild(img);
            slidesWrapper.appendChild(slideDiv);
        }

        function updateSlidePosition() {
            // Move slides wrapper
            slidesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;

            // Button states
            prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
            prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';

            nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.5' : '1';
            nextBtn.style.pointerEvents = currentSlide === totalSlides - 1 ? 'none' : 'auto';
        }

        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlidePosition();
            }
        }

        function prevSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlidePosition();
            }
        }

        // Event Listeners
        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        // Keyboard Navigation
        document.addEventListener('keydown', (e) => {
            // Only capture if presentation section is in view or generally active
            // Check if slides app is active
            const slidesApp = document.getElementById('ipad-slides');
            if (slidesApp && slidesApp.classList.contains('active')) {
                if (e.key === 'ArrowRight') {
                    nextSlide();
                } else if (e.key === 'ArrowLeft') {
                    prevSlide();
                }
            }
        });

        // Touch Support
        let touchStartX = 0;
        let touchEndX = 0;

        slidesWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slidesWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) nextSlide();
            if (touchEndX > touchStartX + 50) prevSlide();
        }, { passive: true });

        // Initial update
        updateSlidePosition();
    }
});
