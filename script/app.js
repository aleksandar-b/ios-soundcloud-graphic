var NUMBER_OF_RECTS = 190;

SC.initialize({
    client_id: 'bec021ee2767f7fc73542076a41c9012',
    redirect_uri: 'https://storymore.com/soundcloud/'
});

var audioContext = new AudioContext();
var audio = document.getElementsByTagName('audio')[0];
audio.crossOrigin = "anonymous";

var source = audioContext.createMediaElementSource(audio);
var analyser = audioContext.createAnalyser();

source.connect(analyser);
analyser.connect(audioContext.destination);

var bufferLength = analyser.frequencyBinCount;
var frequencyData = new Uint8Array(bufferLength);

var svg = document.getElementsByClassName('rects')[0];
var movingLine = document.getElementById('moving-line');

let counter = 0;
for (var i = 0; i < NUMBER_OF_RECTS; i++) {
    var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", counter);
    rect.setAttribute("y", "400");
    rect.style.transform = "scale(0)";

    counter = counter + 9.16;
    svg.appendChild(rect);
}

var ml = document.createElementNS("http://www.w3.org/2000/svg", "path");
ml.setAttribute("d", "M0 400");
ml.setAttribute("stroke", "white");
ml.setAttribute("fill", "none");
ml.setAttribute("id", "moving-line");

var rects = document.getElementsByTagName('rect');

var counterRects = 0;
var movingLineX = 0;
var movingLineStart = 'M0 400';
var pointArrays = [];


function Render() {
    analyser.getByteFrequencyData(frequencyData);

    if (counterRects < NUMBER_OF_RECTS) {
        var num = 0;

        for (var i = 0; i < 1024; i++) {
            num += frequencyData[i];
        }
        movingLineX += 8.91;
        pointArrays.push(' L ' + movingLineX + ' ' + (300 - (num / 1024 * 2)));

        movingLine.setAttribute('d', movingLineStart + pointArrays.slice(-500).join());

        const player = rects[counterRects].animate([
            {
                transform: 'scaleY(0)'
            },
            {
                transform: `scaleY(${(num / 1024) * 2})`
            }], {
            duration: 800,
            iterations: 1,
            easing: 'ease-out',
            delay: 0,
            fill: 'forwards'
        });

        counter = counter + 8.16;
        counterRects++;

    } else if (counterRects === NUMBER_OF_RECTS) {

        svg.classList.remove('move');
        counterRects++;

    } else {

        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        svg.appendChild(ml);
        pointArrays.splice(0, pointArrays.length);

        movingLineX = 0;
        var secCounter = 0;

        for (var k = 0; k < NUMBER_OF_RECTS; k++) {
            var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

            rect.setAttribute("x", secCounter);
            rect.setAttribute("y", "400");
            rect.style.transform = "scale(0)";
            secCounter = secCounter + 9.16;
            svg.appendChild(rect);
        }

        svg.classList.add('move');
        counterRects = 0;
        movingLine = document.getElementById('moving-line');
    }

    requestAnimationFrame(Render);
}

var request = new XMLHttpRequest();

request.open('GET', 'https://api.soundcloud.com/tracks/289272149/stream?client_id=237d195ad90846f5e6294ade2e8cf87b', true);
request.responseType = 'blob';

request.onload = function () {
    audio.src = window.URL.createObjectURL(request.response);
    setTimeout(function () {
        console.log(request.response);
        audio.play();
        Render();
    }, 1000);
};

request.send();

function getTracks(event, query) {
    if (!query) {
        return;
    }

    loadingState();
    SC.get('/tracks', {
        q: query,
        limit: 6
    }).then(function (tracks) {
        loadedState();
        clearList();
        tracks.forEach(function (track) {
            addToList(track);
        });
    });

}

function loadingState() {
    document.querySelector('.list').style.display = 'none';
    document.querySelector('.loader').style.display = 'block';
}

function loadedState() {
    document.querySelector('.list').style.display = 'block';
    document.querySelector('.loader').style.display = 'none';
}

function clearList() {
    document.querySelector('.list').innerHTML = "";
}

function addToList(track) {
    document.querySelector('.list').appendChild(new Item(track.title, track.stream_url, track.artwork_url).create());
}

function Item(content, url, picUrl) {
    this.listItem = document.createElement('div');
    this.listItem.classList.add('item');
    this.listItem.setAttribute('data-url', url);
    this.listItem.setAttribute('data-picUrl', picUrl);
    this.listItem.setAttribute('data-songName', content);
    this.contentSpan = document.createElement('span');
    this.contentSpan.textContent = content;
    this.contentSpan.classList.add('truncate');
    this.listItem.appendChild(this.contentSpan);

    this.create = function () {
        return this.listItem;
    }
}

function setCurrentSong (songName, picUrl) {
    document.getElementById('picUrl').src = picUrl;
    document.getElementById('currentSong').textContent = songName;
}

$('body').on('click', '.item', function () {
    audio.pause();
    audio.setAttribute('src', $(this).data('url') + '?client_id=' + '237d195ad90846f5e6294ade2e8cf87b');
    setCurrentSong($(this).data('songname'), $(this).data('picurl'));
    audio.play();
});

SC.get('/tracks', {
    q: "All or nothing frequencies",
    limit: 6
}).then(function (tracks) {
    clearList();
    setCurrentSong(tracks[0].title, tracks[0].artwork_url);
    tracks.forEach(function (track) {
        addToList(track);
    });
});
