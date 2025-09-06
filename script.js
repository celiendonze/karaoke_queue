let karokeQueue = [];
let fileInputContainer = document.getElementById('file-input-container');
let fileInput = document.getElementById('file-input');
let fileInputLabel = document.getElementById('file-input-label');

let songsContainer = document.getElementById('songs-container');
let songsList = document.getElementById('songs-list');
let songSearch = document.getElementById('song-search');
let selectedSongInput = document.getElementById('selected-song');
let selectedSong = '';
let singerName = document.getElementById('singer-name');
let submitBtn = document.getElementById('submit-btn');

let errorMessage = document.getElementById('error-message');

let queueList = document.getElementById('queue-list');
let queueBody = document.getElementById('queue-body');
let nextBtn = document.getElementById('next-btn');
let currentSong = document.getElementById('current-song');
let resetBtn = document.getElementById('reset-btn');
let allSongs = [];

document.addEventListener('DOMContentLoaded', function () {
    const storedQueue = JSON.parse(localStorage.getItem('karaoke_queue'));
    if (storedQueue) {
        karokeQueue = storedQueue;
    }
    updateQueueList();
    // load all songs from storage if exists
    const storedSongs = JSON.parse(localStorage.getItem('karaoke_songs'));
    if (storedSongs) {
        allSongs = storedSongs;
        document.getElementById('hide-at-start').hidden = false;
        fileInputContainer.hidden = true;
        updateSongsList(allSongs);
    }
});

resetBtn.addEventListener('click', function () {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser la file d\'attente et la liste des chansons ?')) {
        return;
    }
    karokeQueue = [];
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
    fileInputContainer.hidden = false;
    document.getElementById('hide-at-start').hidden = true;
});

function updateQueueList() {
    queueBody.innerHTML = '';
    document.getElementById('queue-info').innerHTML = '';
    if (karokeQueue.length === 0) {
        document.getElementById('queue-info').innerHTML = '<p>Aucune chanson en attente.</p>';
        currentSong.textContent = 'Aucune chanson en attente.';
        return;
    }

    currentSong.textContent = karokeQueue[0].singer + ' chante ' + karokeQueue[0].song;
    karokeQueue.forEach((item, index) => {
        const queueItem = createTableRow(item, index);
        queueBody.appendChild(queueItem);
    });
}

function createTableRow(item, index) {
    const queueItem = document.createElement('tr');
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
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn', 'btn', 'btn-outline-danger', 'btn-sm', 'mt-1');
    removeBtn.textContent = 'Supprimer';
    removeBtn.addEventListener('click', function () {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette chanson de la file d\'attente ?')) {
            return;
        }
        karokeQueue.splice(index, 1);
        localStorage.setItem('karaoke_queue', JSON.stringify(karokeQueue));
        updateQueueList();
    });
    actionsCell.appendChild(removeBtn);
    queueItem.appendChild(actionsCell);
    return queueItem;
}

function updateSongsList(songs) {
    songsList.innerHTML = '';
    songs.forEach((line, index) => {
        const songItem = document.createElement('div');
        songItem.classList.add('song-item');
        songItem.classList.add('p-2', 'border-bottom');
        songItem.textContent = line;
        songsList.appendChild(songItem);
    });
}

// filter songs list based on search input
songSearch.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const filteredSongs = allSongs.filter(song => song.toLowerCase().includes(query));
    updateSongsList(filteredSongs);
});
// select song from list
songsList.addEventListener('click', function (event) {
    if (event.target.classList.contains('song-item')) {
        selectedSong = event.target.textContent;
        selectedSongInput.textContent = 'Chanson sélectionnée: ' + selectedSong;
        singerName.focus();
    }
});
// when user presses enter in singerName input
singerName.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        submitBtn.click();
    }
});
// submit button click
submitBtn.addEventListener('click', function () {
    if (selectedSong && singerName.value.trim()) {
        karokeQueue.push({ song: selectedSong, singer: singerName.value.trim() });
        localStorage.setItem('karaoke_queue', JSON.stringify(karokeQueue));
        // reset inputs
        selectedSong = '';
        selectedSongInput.textContent = 'Aucune chanson sélectionnée';
        singerName.value = '';
        errorMessage.textContent = '';
        songSearch.value = '';
        updateSongsList(allSongs);
        updateQueueList();
    } else {
        if (!selectedSong && singerName.value.trim() === '') {
            errorMessage.textContent = 'Veuillez sélectionner une chanson et entrer le nom du chanteur.';
            singerName.focus();
            return;
        }
        if (singerName.value.trim() === '') {
            errorMessage.textContent = 'Veuillez entrer le nom du chanteur.';
            singerName.focus();
            return;
        }
        if (!selectedSong) {
            selectedSongInput.textContent = 'Veuillez sélectionner une chanson.';
        }
    }
});
// next button click
nextBtn.addEventListener('click', function () {
    if (karokeQueue.length > 0) {
        karokeQueue.shift();
        updateQueueList();
        errorMessage.textContent = '';
    } else {
        errorMessage.textContent = 'La file d\'attente est vide.';
    }
});

// read file input
fileInput.addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (file) {
        // read txt file first few lines
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                const lines = text.split('\n');
                allSongs = lines.map(line => line.trim()).filter(line => line.length > 0);
                // remove .txt extension if present
                allSongs = allSongs.map(line => line.endsWith('.txt') ? line.slice(0, -4) : line);
                // save all songs
                localStorage.setItem('karaoke_songs', JSON.stringify(allSongs));
                // populate songs list
                updateSongsList(allSongs);
            };
            reader.readAsText(file);
            fileInputContainer.hidden = true;
            document.getElementById('hide-at-start').hidden = false;
            return;
        } else {
            errorMessage.innerHTML = '<p>Unsupported file type. Please upload a .txt file.</p>';
        }
    } else {
        errorMessage.innerHTML = '<p>No file selected</p>';
    }
});