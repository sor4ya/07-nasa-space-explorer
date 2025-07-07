// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
// Find the "Get Space Images" button
const getImagesBtn = document.querySelector('button');
// Find the gallery container
const gallery = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const apiKey = 'PaX5DXGeKWWho5oeRgaOpMx5LhRDxE2X1xDU6s0D';

// NASA APOD API endpoint
const apiUrl = 'https://api.nasa.gov/planetary/apod';

/**
 * Fetches correct data.
 */
async function fetchApodData(startDate, endDate) {
  // Build the API URL with query parameters
  const url = `${apiUrl}?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  try {
    // Fetch data from NASA's API
    const response = await fetch(url);
    // Convert the response to JSON
    const data = await response.json();
    // Return the data (an array of image objects)
    return data;
  } catch (error) {
    // If there's an error, log it to the console
    console.error('Error fetching APOD data:', error);
    return [];
  }
}

// Create and add a modal to the page for full-size image display
const modal = document.createElement('div');
modal.id = 'imageModal';
modal.className = 'modal';
modal.innerHTML = `
  <div class="modal-content">
    <span class="close" id="modalClose">&times;</span>
    <img id="modalImg" src="" alt="Full Size" />
    <h3 id="modalTitle"></h3>
    <p id="modalDate"></p>
    <p id="modalExplanation"></p>
  </div>
`;
document.body.appendChild(modal);

// Function to open the modal with image data
function openModal(item) {
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalExplanation = document.getElementById('modalExplanation');
  modalImg.src = item.hdurl || item.url;
  modalImg.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = `Date: ${item.date}`;
  modalExplanation.textContent = item.explanation;
  modal.style.display = 'block';
}

// Close modal when X is clicked or when clicking outside modal content
modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.id === 'modalClose') {
    modal.style.display = 'none';
  }
});

// Listen for button click to fetch and display images
getImagesBtn.addEventListener('click', async () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Fetch APOD data for the selected date range
  const apodData = await fetchApodData(startDate, endDate);

  // Clear the gallery
  gallery.innerHTML = '';

  // Check if we got data
  if (Array.isArray(apodData) && apodData.length > 0) {
    const fragment = document.createDocumentFragment();
    let imageCount = 0;
    apodData.forEach(item => {
      // Only show images (not videos) and limit to 9
      if (item.media_type === 'image' && imageCount < 9) {
        // Create a div for the gallery item (not using Bootstrap)
        const card = document.createElement('div');
        card.className = 'gallery-item';

        // Create the image element
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.title;
        // Add click event to open modal
        img.addEventListener('click', () => openModal(item));

        // Create the title
        const title = document.createElement('h3');
        title.textContent = item.title;

        // Create the date
        const date = document.createElement('p');
        date.textContent = `Date: ${item.date}`;

        // Add image, title, and date to card
        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(date);

        // Add card to fragment
        fragment.appendChild(card);
        imageCount++;
      }
    });
    // Add all cards to the gallery
    gallery.appendChild(fragment);
  } else {
    // If no data, show a message
    gallery.innerHTML = '<p>No images found for this date range.</p>';
  }
});

