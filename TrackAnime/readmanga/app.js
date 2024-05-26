document.addEventListener('DOMContentLoaded', async () => {
    const PROXY_URL = 'http://localhost:3000/list';
    
    async function getMangaList() {
        try {
            const response = await fetch(PROXY_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // console.log(response.text())
            const data = await response.json();
            console.log(typeof data); // Добавлено для отладки
            // displayMangaList(data);
        } catch (error) {
            console.error('Error fetching manga list:', error);
        }
    }

    function displayMangaList(mangaList) {
        if (!Array.isArray(mangaList)) {
            console.error('Expected an array but got:', mangaList);
            return;
        }
        
        const mangaListElement = document.getElementById('manga-list');
        mangaList.forEach(manga => {
            const li = document.createElement('li');
            li.textContent = manga.title;
            mangaListElement.appendChild(li);
        });
    }

    getMangaList();
});
