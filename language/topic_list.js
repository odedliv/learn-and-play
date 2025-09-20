document.addEventListener('DOMContentLoaded', function() {
    // Call loadTopics immediately when DOM is ready
    loadTopics();

    async function loadTopics() {
        // Define the path to the index file
        const indexPath = './data/topic_index.json';

        console.log('[DEBUG] Loading topics from:', indexPath);
        console.log('[DEBUG] Current URL:', window.location.href);

        try {
            // Fetch the index file (with cache busting to ensure fresh data)
            const cacheBuster = `?t=${Date.now()}`;
            const response = await fetch(indexPath + cacheBuster);

            if (!response.ok) {
                throw new Error(`Failed to load topics: ${response.status}`);
            }

            // Parse the JSON data
            const data = await response.json();

            console.log('[DEBUG] Loaded topic_index.json:', data);
            console.log('[DEBUG] Total files in index:', data.total_files);
            console.log('[DEBUG] Files found:', data.files.map(f => f.filename));

            // Access the files array
            const files = data.files;

            // Get the topic selection area div
            const topicSelectionArea = document.getElementById('topic-selection-area');

            console.log('[DEBUG] Creating buttons for', files.length, 'topics');

            // Create a button for each file
            files.forEach((file, index) => {
                console.log(`[DEBUG] Creating button ${index + 1}:`, file.filename);
                // Create a new button element
                const button = document.createElement('button');

                // Clean the filename for display (remove .json suffix)
                const displayName = file.filename.replace('.json', '').replace(/_/g, ' ');

                // Set the button text with filename and number of entries
                button.textContent = `${displayName} (${file.total_entries} ערכים)`;

                // Store the full path to the data file as a data attribute
                button.dataset.filePath = `./data/${file.filename}`;

                // Add click event listener to the button
                button.addEventListener('click', function() {
                    startGame(button.dataset.filePath);
                });

                // Append the button to the topic selection area
                topicSelectionArea.appendChild(button);
            });

        } catch (error) {
            console.error('Error loading topics:', error);
            // Optionally display an error message to the user
            const topicSelectionArea = document.getElementById('topic-selection-area');
            topicSelectionArea.innerHTML = '<p style="color: red;">שגיאה בטעינת הנושאים. נסה לרענן את הדף.</p>';
        }
    }

    // Start the game with the selected topic
    function startGame(filePath) {
        console.log('Loading game from:', filePath);

        // Initialize the memory game with the selected data file
        if (typeof MemoryGame !== 'undefined') {
            MemoryGame.init(filePath);
        } else {
            console.error('MemoryGame engine not loaded');
            alert('שגיאה בטעינת מנוע המשחק');
        }
    }
});
