document.addEventListener('DOMContentLoaded', function() {
    // Sample initial data
    let books = [
        { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "fiction", status: "available", history: [] },
        { id: 2, title: "Sapiens", author: "Yuval Noah Harari", category: "non-fiction", status: "available", history: [] },
        { id: 3, title: "The Selfish Gene", author: "Richard Dawkins", category: "science", status: "borrowed", history: [
            { date: "2023-05-10", action: "borrowed", by: "John Doe" },
            { date: "2023-04-15", action: "returned", by: "John Doe" },
            { date: "2023-03-20", action: "borrowed", by: "Jane Smith" }
        ]},
        { id: 4, title: "Becoming", author: "Michelle Obama", category: "biography", status: "available", history: [] }
    ];

    // DOM elements
    const booksContainer = document.getElementById('booksContainer');
    const categoryItems = document.querySelectorAll('#categoryList li');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resetSearchBtn = document.getElementById('resetSearchBtn');
    const addBookForm = document.getElementById('addBookForm');
    const modal = document.getElementById('bookDetailsModal');
    const closeBtn = document.querySelector('.close-btn');
    const borrowBtn = document.getElementById('borrowBtn');
    const returnBtn = document.getElementById('returnBtn');
    const deleteBtn = document.getElementById('deleteBtn');

    // Current filter state
    let currentCategory = 'all';
    let currentSearch = '';

    // Initialize the app
    renderBooks();

    // Event listeners
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Update active category
            categoryItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Update current category and re-render
            currentCategory = this.dataset.category;
            document.getElementById('listTitle').textContent = 
                currentCategory === 'all' ? 'All Books' : `${this.textContent} Books`;
            renderBooks();
        });
    });

    // Fixed search functionality
    searchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });

    // Add search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    resetSearchBtn.addEventListener('click', function(e) {
        e.preventDefault();
        searchInput.value = '';
        currentSearch = '';
        renderBooks();
    });

    addBookForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('bookTitle').value.trim();
        const author = document.getElementById('bookAuthor').value.trim();
        const category = document.getElementById('bookCategory').value;
        
        if (title && author && category) {
            const newBook = {
                id: Date.now(), // Simple unique ID
                title,
                author,
                category,
                status: "available",
                history: []
            };
            
            books.push(newBook);
            renderBooks();
            addBookForm.reset();
        }
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Book card click handler (delegated)
    booksContainer.addEventListener('click', function(e) {
        const bookCard = e.target.closest('.book-card');
        if (bookCard) {
            const bookId = parseInt(bookCard.dataset.id);
            const book = books.find(b => b.id === bookId);
            if (book) {
                showBookDetails(book);
            }
        }
    });

    // Modal action buttons
    let currentBookInModal = null;

    borrowBtn.addEventListener('click', function() {
        if (currentBookInModal && currentBookInModal.status === 'available') {
            const borrowerName = prompt("Enter your name:");
            if (borrowerName) {
                currentBookInModal.status = 'borrowed';
                currentBookInModal.history.unshift({
                    date: new Date().toISOString().split('T')[0],
                    action: 'borrowed',
                    by: borrowerName
                });
                renderBooks();
                showBookDetails(currentBookInModal);
            }
        }
    });

    returnBtn.addEventListener('click', function() {
        if (currentBookInModal && currentBookInModal.status === 'borrowed') {
            currentBookInModal.status = 'available';
            currentBookInModal.history.unshift({
                date: new Date().toISOString().split('T')[0],
                action: 'returned',
                by: currentBookInModal.history[0].by // Last borrower
            });
            renderBooks();
            showBookDetails(currentBookInModal);
        }
    });

    deleteBtn.addEventListener('click', function() {
        if (currentBookInModal && confirm("Are you sure you want to delete this book?")) {
            books = books.filter(b => b.id !== currentBookInModal.id);
            renderBooks();
            modal.style.display = 'none';
        }
    });

    // Functions
    function performSearch() {
        currentSearch = searchInput.value.trim().toLowerCase();
        renderBooks();
    }

    function renderBooks() {
        booksContainer.innerHTML = '';
        
        let filteredBooks = books;
        
        // Apply category filter
        if (currentCategory !== 'all') {
            filteredBooks = filteredBooks.filter(book => book.category === currentCategory);
        }
        
        // Apply search filter
        if (currentSearch) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(currentSearch) || 
                book.author.toLowerCase().includes(currentSearch));
        }
        
        // Render books
        if (filteredBooks.length === 0) {
            booksContainer.innerHTML = '<p>No books found.</p>';
            return;
        }
        
        filteredBooks.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.dataset.id = book.id;
            
            bookCard.innerHTML = `
                <h3>${book.title}</h3>
                <p>by ${book.author}</p>
                <p class="category">${formatCategory(book.category)}</p>
                <span class="book-status status-${book.status}">
                    ${book.status === 'available' ? 'Available' : 'Borrowed'}
                </span>
            `;
            
            booksContainer.appendChild(bookCard);
        });
    }
    
    function showBookDetails(book) {
        currentBookInModal = book;
        
        document.getElementById('modalBookTitle').textContent = book.title;
        document.getElementById('modalBookAuthor').textContent = book.author;
        document.getElementById('modalBookCategory').textContent = formatCategory(book.category);
        document.getElementById('modalBookStatus').textContent = 
            book.status === 'available' ? 'Available' : 'Borrowed';
        
        // Update button visibility
        borrowBtn.style.display = book.status === 'available' ? 'block' : 'none';
        returnBtn.style.display = book.status === 'borrowed' ? 'block' : 'none';
        
        // Render history
        const historyList = document.getElementById('borrowingHistoryList');
        historyList.innerHTML = '';
        
        if (book.history.length === 0) {
            historyList.innerHTML = '<li>No borrowing history</li>';
        } else {
            book.history.forEach(record => {
                const li = document.createElement('li');
                li.textContent = `${record.date}: ${record.action} by ${record.by}`;
                historyList.appendChild(li);
            });
        }
        
        modal.style.display = 'flex';
    }
    
    function formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
});