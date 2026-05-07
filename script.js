(function () {
    'use strict';

    let karaokeQueue = [];
    let allSongs = [];
    let selectedSong = '';

    const fileInputContainer = document.getElementById('file-input-container');
    const fileInput = document.getElementById('file-input');
    const songsList = document.getElementById('songs-list');
    const songSearch = document.getElementById('song-search');
    const selectedSongInput = document.getElementById('selected-song');
    const singerName = document.getElementById('singer-name');
    const submitBtn = document.getElementById('submit-btn');
    const errorMessage = document.getElementById('error-message');
    const queueBody = document.getElementById('queue-body');
    const nextBtn = document.getElementById('next-btn');
    const currentSong = document.getElementById('current-song');
    const resetBtn = document.getElementById('reset-btn');
    const queueInfo = document.getElementById('queue-info');
    const hideAtStart = document.getElementById('hide-at-start');
    const songCount = document.getElementById('song-count');

    function updateQueueList() {
        queueBody.innerHTML = '';
        queueInfo.textContent = '';
        if (karaokeQueue.length === 0) {
            queueInfo.textContent = 'Aucune chanson en attente.';
            currentSong.textContent = 'Aucune chanson en attente.';
            return;
        }

        currentSong.textContent = karaokeQueue[0].singer + ' chante ' + karaokeQueue[0].song;
        karaokeQueue.forEach(function (item, index) {
            const queueItem = createTableRow(item, index);
            queueBody.appendChild(queueItem);
        });
    }

    function createTableRow(item, index) {
        const queueItem = document.createElement('tr');
        if (index === 0) {
            queueItem.classList.add('now-playing');
        }
        const numberCell = document.createElement('td');
        numberCell.textContent = (index + 1) + '.';
        queueItem.appendChild(numberCell);
        const singerCell = document.createElement('td');
        singerCell.textContent = item.singer;
        queueItem.appendChild(singerCell);
        const songCell = document.createElement('td');
        songCell.textContent = item.song;
        queueItem.appendChild(songCell);
        const actionsCell = document.createElement('td');
        if (index > 0) {
            const upBtn = document.createElement('button');
            upBtn.classList.add('btn', 'btn-outline-secondary', 'btn-sm', 'me-1');
            upBtn.textContent = '\u2191';
            upBtn.dataset.action = 'move-up';
            upBtn.dataset.index = index;
            actionsCell.appendChild(upBtn);
        }
        if (index < karaokeQueue.length - 1) {
            const downBtn = document.createElement('button');
            downBtn.classList.add('btn', 'btn-outline-secondary', 'btn-sm', 'me-1');
            downBtn.textContent = '\u2193';
            downBtn.dataset.action = 'move-down';
            downBtn.dataset.index = index;
            actionsCell.appendChild(downBtn);
        }
        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-btn', 'btn', 'btn-outline-danger', 'btn-sm');
        removeBtn.textContent = '\u2716';
        removeBtn.dataset.index = index;
        actionsCell.appendChild(removeBtn);
        queueItem.appendChild(actionsCell);
        return queueItem;
    }

    function updateSongsList(songs) {
        songsList.innerHTML = '';
        songs.forEach(function (line) {
            const songItem = document.createElement('div');
            songItem.classList.add('song-item', 'p-2', 'border-bottom');
            songItem.textContent = line;
            songItem.dataset.song = line;
            songsList.appendChild(songItem);
        });
    }

    function filterSongs(query) {
        const items = songsList.querySelectorAll('.song-item');
        const q = query.toLowerCase();
        let visibleCount = 0;
        items.forEach(function (item) {
            const match = !q || item.dataset.song.toLowerCase().includes(q);
            item.style.display = match ? '' : 'none';
            if (match) visibleCount++;
        });
        songCount.textContent = visibleCount + ' chanson' + (visibleCount !== 1 ? 's' : '') + ' trouv\u00e9e' + (visibleCount !== 1 ? 's' : '');
    }

    document.addEventListener('DOMContentLoaded', function () {
        const storedQueue = JSON.parse(localStorage.getItem('karaoke_queue'));
        if (storedQueue) {
            karaokeQueue = storedQueue;
        }
        updateQueueList();

        const storedSongs = JSON.parse(localStorage.getItem('karaoke_songs'));
        if (storedSongs) {
            allSongs = storedSongs;
            hideAtStart.hidden = false;
            fileInputContainer.hidden = true;
            updateSongsList(allSongs);
        }

        resetBtn.addEventListener('click', function () {
            if (!confirm('Êtes-vous sûr de vouloir réinitialiser la file d\'attente et la liste des chansons ?')) {
                return;
            }
            karaokeQueue = [];
            allSongs = [];
            localStorage.removeItem('karaoke_queue');
            localStorage.removeItem('karaoke_songs');
            updateQueueList();
            updateSongsList([]);
            fileInput.value = '';
            selectedSongInput.textContent = 'Aucune chanson sélectionnée';
            singerName.value = '';
            errorMessage.textContent = '';
            songSearch.value = '';
            songCount.textContent = '';
            fileInputContainer.hidden = false;
            hideAtStart.hidden = true;
        });

        songSearch.addEventListener('input', function () {
            filterSongs(this.value);
        });

        songsList.addEventListener('click', function (event) {
            const songItem = event.target.closest('.song-item');
            if (songItem) {
                selectedSong = songItem.dataset.song;
                selectedSongInput.textContent = 'Chanson s\u00e9lectionn\u00e9e: ' + selectedSong;
                singerName.focus();
            }
        });

        singerName.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                submitBtn.click();
            }
        });

        submitBtn.addEventListener('click', function () {
            if (selectedSong && singerName.value.trim()) {
                const singer = singerName.value.trim();
                const isDuplicate = karaokeQueue.some(function (entry) {
                    return entry.song === selectedSong && entry.singer === singer;
                });
                if (isDuplicate) {
                    errorMessage.textContent = 'Cette chanson d\u00e9j\u00e0 dans la file d\u2019attente pour ce chanteur.';
                    return;
                }
                karaokeQueue.push({ song: selectedSong, singer: singer });
                localStorage.setItem('karaoke_queue', JSON.stringify(karaokeQueue));
                selectedSong = '';
                selectedSongInput.textContent = 'Aucune chanson s\u00e9lectionn\u00e9e';
                singerName.value = '';
                errorMessage.textContent = '';
                songSearch.value = '';
                filterSongs('');
                updateQueueList();
            } else {
                if (!selectedSong && singerName.value.trim() === '') {
                    errorMessage.textContent = 'Veuillez s\u00e9lectionner une chanson et entrer le nom du chanteur.';
                    singerName.focus();
                    return;
                }
                if (singerName.value.trim() === '') {
                    errorMessage.textContent = 'Veuillez entrer le nom du chanteur.';
                    singerName.focus();
                    return;
                }
                if (!selectedSong) {
                    selectedSongInput.textContent = 'Veuillez s\u00e9lectionner une chanson.';
                }
            }
        });

        nextBtn.addEventListener('click', function () {
            if (karaokeQueue.length > 0) {
                karaokeQueue.shift();
                localStorage.setItem('karaoke_queue', JSON.stringify(karaokeQueue));
                updateQueueList();
                errorMessage.textContent = '';
            } else {
                errorMessage.textContent = 'La file d\'attente est vide.';
            }
        });

        queueBody.addEventListener('click', function (event) {
            const btn = event.target.closest('button');
            if (!btn) return;
            const index = parseInt(btn.dataset.index, 10);

            if (btn.classList.contains('remove-btn')) {
                if (!confirm('Êtes-vous s\u00fbr de vouloir supprimer cette chanson de la file d\'attente ?')) {
                    return;
                }
                karaokeQueue.splice(index, 1);
            } else if (btn.dataset.action === 'move-up' && index > 0) {
                const temp = karaokeQueue[index];
                karaokeQueue[index] = karaokeQueue[index - 1];
                karaokeQueue[index - 1] = temp;
            } else if (btn.dataset.action === 'move-down' && index < karaokeQueue.length - 1) {
                const temp = karaokeQueue[index];
                karaokeQueue[index] = karaokeQueue[index + 1];
                karaokeQueue[index + 1] = temp;
            } else {
                return;
            }

            localStorage.setItem('karaoke_queue', JSON.stringify(karaokeQueue));
            updateQueueList();
        });

        fileInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                if (file.type === 'text/plain') {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const text = e.target.result;
                        const lines = text.split('\n');
                        allSongs = lines.map(function (line) { return line.trim(); }).filter(function (line) { return line.length > 0; });
                        allSongs = allSongs.map(function (line) { return line.endsWith('.txt') ? line.slice(0, -4) : line; });
                        localStorage.setItem('karaoke_songs', JSON.stringify(allSongs));
                        updateSongsList(allSongs);
                        filterSongs('');
                    };
                    reader.readAsText(file);
                    fileInputContainer.hidden = true;
                    hideAtStart.hidden = false;
                    return;
                } else {
                    errorMessage.textContent = 'Type de fichier non pris en charge. Veuillez t\u00e9l\u00e9charger un fichier .txt.';
                }
            } else {
                errorMessage.textContent = 'Aucun fichier s\u00e9lectionn\u00e9.';
            }
        });
    });
})();
