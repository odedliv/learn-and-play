document.addEventListener('DOMContentLoaded', function() {
    // Call loadTopics immediately when DOM is ready
    loadTopics();

    async function loadTopics() {
        // Define the path to the index file
        const indexPath = './data/topic_index.json';

        try {
            // Fetch the index file
            const response = await fetch(indexPath);

            if (!response.ok) {
                throw new Error(`Failed to load topics: ${response.status}`);
            }

            // Parse the JSON data
            const data = await response.json();

            // Access the files array
            const files = data.files;

            // Get the topic selection area div
            const topicSelectionArea = document.getElementById('topic-selection-area');

            // Create a button for each file
            files.forEach(file => {
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

    // Placeholder function for starting the game
    function startGame(filePath) {
        console.log('Loading game from:', filePath);
    }
});
