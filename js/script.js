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
  const url = `${apiUrl}?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

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

// Create and add a modal to the page for full-size image/video display
const modal = document.createElement('div');
modal.id = 'imageModal';
modal.className = 'modal';
modal.innerHTML = `
  <div class="modal-content">
    <span class="close" id="modalClose">&times;</span>
    <div id="modalMedia"></div>
    <h3 id="modalTitle"></h3>
    <p id="modalDate"></p>
    <p id="modalExplanation"></p>
  </div>
`;
document.body.appendChild(modal);


// Function to open the modal with image or video data
function openModal(item) {
  const modalMedia = document.getElementById('modalMedia');
  const modalTitle = document.getElementById('modalTitle');
  const modalDate = document.getElementById('modalDate');
  const modalExplanation = document.getElementById('modalExplanation');
  
  // Clear previous content
  modalMedia.innerHTML = '';
  
  if (item.media_type === 'video') {
    // Handle video content
    const videoUrl = item.url;
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${videoUrl}`;
    iframe.width = '100%';
    iframe.height = '315';
    // iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    modalMedia.appendChild(iframe);

  } else {
    // Handle image content
    const img = document.createElement('img');
    img.src = item.hdurl || item.url;
    img.alt = item.title;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '400px';
    img.style.borderRadius = '8px';
    img.style.marginBottom = '20px';
    img.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
    modalMedia.appendChild(img);
  }
  
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

  // Show loading message
  gallery.innerHTML = `
    <div class="loading">
      <div class="loading-icon">🚀</div>
      <p>Loading amazing space images...</p>
    </div>
  `;

  // Fetch APOD data for the selected date range
  const apodData = await fetchApodData(startDate, endDate);

  // Clear the gallery (removes loading message)
  gallery.innerHTML = '';

  // Check if we got data
  if (Array.isArray(apodData) && apodData.length > 0) {
    const fragment = document.createDocumentFragment();
    let itemCount = 0;
    apodData.forEach(item => {
      // Show both images and videos, limit to 9 total items
      if ((item.media_type === 'image' || item.media_type === 'video') && itemCount < 9) {
        // Create a div for the gallery item 
        const card = document.createElement('div');
        card.className = 'gallery-item';
        
        if (item.media_type === 'video') {
          // Handle video content for gallery
          const videoUrl = item.url;

          const videoContainer = document.createElement('div');
          videoContainer.className = 'video-thumbnail-container';
          
          const thumbnail = document.createElement('img');
          thumbnail.src = `${item.thumbnail_url}`;
          thumbnail.alt = item.title;
          thumbnail.className = 'video-thumbnail';
        
          
          videoContainer.appendChild(thumbnail);
          
          // Add click event to open modal
          videoContainer.addEventListener('click', () => openModal(item));
          card.appendChild(videoContainer);

        } else {
          // Handle image content for gallery
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = item.title;
          // Add click event to open modal
          img.addEventListener('click', () => openModal(item));
          card.appendChild(img);
        }

        // Create the title
        const title = document.createElement('h3');
        title.textContent = item.title;

        // Create the date with media type indicator
        const date = document.createElement('p');
        const mediaIcon = item.media_type === 'video' ? '🎬 ' : '📷 ';
        date.textContent = `${mediaIcon}${item.date}`;

        // Add title and date to card
        card.appendChild(title);
        card.appendChild(date);

        // Add card to fragment
        fragment.appendChild(card);
        itemCount++;
      }
    });
    // Add all cards to the gallery
    gallery.appendChild(fragment);
  } else {
    // If no data, show a message
    gallery.innerHTML = '<p>No images or videos found for this date range.</p>';
  }
});

