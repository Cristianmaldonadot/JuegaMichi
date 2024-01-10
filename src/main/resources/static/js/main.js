'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm1 = document.querySelector('#usernameForm1');
var usernameForm2 = document.querySelector('#usernameForm2');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var colorDiv = document.querySelector("#miDiv");
var title = document.querySelector("#title");

var michi1 = document.querySelector('#michi-1');
var michi2 = document.querySelector('#michi-2');
var michi3 = document.querySelector('#michi-3');
var michi4 = document.querySelector('#michi-4');
var michi5 = document.querySelector('#michi-5');
var michi6 = document.querySelector('#michi-6');
var michi7 = document.querySelector('#michi-7');
var michi8 = document.querySelector('#michi-8');
var michi9 = document.querySelector('#michi-9');

michi1.style.backgroundImage = 'url("../assets/circle01.svg")';
michi2.style.backgroundImage = 'url("../assets/circle02.svg")';
michi3.style.backgroundImage = 'url("../assets/circle03.svg")';
michi4.style.backgroundImage = 'url("../assets/circle04.svg")';
michi5.style.backgroundImage = 'url("../assets/circle05.svg")';
michi6.style.backgroundImage = 'url("../assets/circle06.svg")';
michi7.style.backgroundImage = 'url("../assets/circle07.svg")';
michi8.style.backgroundImage = 'url("../assets/circle08.svg")';
michi9.style.backgroundImage = 'url("../assets/circle09.svg")';

var stompClient = null;
var username = null;
var idsala = null;
var userturno = null;

var idusuario = 0;
var idjuego = 1;
var iddiv = 0;
var reset = 0;
var messagesender = null;

var misArreglos = [michi1, michi2, michi3, michi4, michi5, michi6, michi7, michi8, michi9];
var misFunciones = [miFuncion1, miFuncion2, miFuncion3, miFuncion4, miFuncion5, miFuncion6, miFuncion7, miFuncion8, miFuncion9];


var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect1(event) {
    username = document.querySelector('#namecreate').value.trim();
    idsala = generarNumeroAleatorio();
    userturno = "player1";
    

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        title.innerHTML = "Spring WebSocket - "+"<strong> Eres "+username+"</strong>"+" - Id Sala "+idsala;

        var socket = new SockJS('/stomp-endpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function connect2(event) {
    username = document.querySelector('#namejoin').value.trim();
    idsala = document.querySelector('#idsalajoin').value.trim();
    userturno = "player2";
    
    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');
        title.innerHTML = "Spring WebSocket - "+"<strong> Eres "+username+"</strong>"+" - Id Sala "+idsala;

        var socket = new SockJS('/stomp-endpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe(`/topic/public${idsala}`, onMessageReceived);

    // Tell your username to the server
    stompClient.send(`/app/chat.addUser/${idsala}`,
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )
    

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send(`/app/chat.sendMessage/${idsala}`, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' ingreso!';
        asignarListeners();
    } else if (message.type === 'LEAVER') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' salio!';
    } else if (message.type === 'MOVIMIENTO'){
		
		var arr = [michi1, michi2, michi3, michi4, michi5, michi6, michi7, michi8, michi9];
		
		var indice = message.iddiv - 1;

		var indice = misArreglos.indexOf(arr[indice]);

    	misArreglos.splice(indice, 1);
    	misFunciones.splice(indice, 1);
		
		console.log(misArreglos);
		console.log(misFunciones);
		
		messageElement.classList.add('event-message');
        message.content = message.sender + ' Jugo te toca!!!';
        var div = document.getElementById(`michi-${message.iddiv}`);
        div.style.backgroundImage = 'url(' + message.color + ')';
        if(idjuego === 1){
			idjuego = 2;
			asignarListeners2();
		}else if(idjuego === 2){
			idjuego = 1;
			asignarListeners();
		}
		
        console.log("Este color es"+message.content);
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
    messagesender = message.sender;
    verificarColores();
    console.log(`Esta es mi sala ${idsala}`);
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

function sendColor(event){
	var messageColor = obtenerColor();
	console.log(messageColor);
    if(messageColor && stompClient) {
        var chatMessage = {
            sender: username,
            color: messageColor,
            type: 'MOVIMIENTO'
        };
        stompClient.send(`/app/chat.sendMessage/${idsala}`, {}, JSON.stringify(chatMessage));
    }
    event.preventDefault();
}

function sendJugada(event){
	var messageColor = obtenerAspaCirculo();
	console.log(messageColor);
    if(messageColor && stompClient) {
        var chatMessage = {
            sender: username,
            color: messageColor,
            iddiv: iddiv,
            type: 'MOVIMIENTO'
        };
        stompClient.send(`/app/chat.sendMessage/${idsala}`, {}, JSON.stringify(chatMessage));
    }
    event.preventDefault();
}


usernameForm1.addEventListener('submit', connect1, true)
usernameForm2.addEventListener('submit', connect2, true)
messageForm.addEventListener('submit', sendMessage, true)

//colorDiv.addEventListener('click', sendColor, true)


function miFuncion1(event) {asignardiv(1);sendJugada(event); removerListeners();}
function miFuncion2(event) {asignardiv(2);sendJugada(event); removerListeners();}
function miFuncion3(event) {asignardiv(3);sendJugada(event); removerListeners();}
function miFuncion4(event) {asignardiv(4);sendJugada(event); removerListeners();}
function miFuncion5(event) {asignardiv(5);sendJugada(event); removerListeners();}
function miFuncion6(event) {asignardiv(6);sendJugada(event); removerListeners();}
function miFuncion7(event) {asignardiv(7);sendJugada(event); removerListeners();}
function miFuncion8(event) {asignardiv(8);sendJugada(event); removerListeners();}
function miFuncion9(event) {asignardiv(9);sendJugada(event); removerListeners();}



function asignarListeners(){
	if(userturno === "player1"){
		for(var i = 0 ; i< misArreglos.length; i++){
			misArreglos[i].addEventListener('click', misFunciones[i], true);
		}
	}else if(userturno === "player2"){
		for(var i = 0 ; i< misArreglos.length; i++){
			misArreglos[i].removeEventListener('click', misFunciones[i], true);
		}
	}
}

function asignarListeners2(){
	if(userturno === "player2"){
		for(var i = 0 ; i< misArreglos.length; i++){
			misArreglos[i].addEventListener('click', misFunciones[i], true);
		}
	}else if(userturno === "player1"){
		for(var i = 0 ; i< misArreglos.length; i++){
			misArreglos[i].removeEventListener('click', misFunciones[i], true);
		}
	}
	
}

function removerListeners(){
	michi1.removeEventListener('click', miFuncion1, true);
    michi2.removeEventListener('click', miFuncion2, true);
    michi3.removeEventListener('click', miFuncion3, true);
    michi4.removeEventListener('click', miFuncion4, true);
    michi5.removeEventListener('click', miFuncion5, true);
    michi6.removeEventListener('click', miFuncion6, true);
    michi7.removeEventListener('click', miFuncion7, true);
    michi8.removeEventListener('click', miFuncion8, true);
    michi9.removeEventListener('click', miFuncion9, true);
    console.log("jugada desactivada");
}

function asignardiv(numero){
	iddiv = numero;
}


function obtenerColor() {
        // Generar un color aleatorio en formato hexadecimal
        var nuevoColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        return nuevoColor;
}

function obtenerAspaCirculo() {
		console.log("Id de juego es " + idjuego);
		var fondo = null;
		if(idjuego === 1 ){
			fondo = "../assets/circle3.svg"
		console.log("Id de juego es " + idjuego);
		}else if (idjuego === 2){
			fondo = "../assets/aspa.svg"
		}
        return fondo;
}

function verificarColores() {
	
        var div1Img = document.getElementById('michi-1').style.backgroundImage;
        var div2Img = document.getElementById('michi-2').style.backgroundImage;
        var div3Img = document.getElementById('michi-3').style.backgroundImage;
        var div4Img = document.getElementById('michi-4').style.backgroundImage;
        var div5Img = document.getElementById('michi-5').style.backgroundImage;
        var div6Img = document.getElementById('michi-6').style.backgroundImage;
        var div7Img = document.getElementById('michi-7').style.backgroundImage;
        var div8Img = document.getElementById('michi-8').style.backgroundImage;
        var div9Img = document.getElementById('michi-9').style.backgroundImage;
        console.log(div1Img);

        if (div1Img === div2Img && div2Img === div3Img) {
            confetti();
            mostrarGanador();
        }else if(div4Img === div5Img && div5Img === div6Img ){
			confetti();
            mostrarGanador();
		}else if(div7Img === div8Img && div8Img === div9Img ){
			confetti();
            mostrarGanador();
		}else if(div1Img === div4Img && div4Img === div7Img ){
			confetti();
            mostrarGanador();
		}else if(div2Img === div5Img && div5Img === div8Img ){
			confetti();
            mostrarGanador();
		}else if(div3Img === div6Img && div6Img === div9Img ){
			confetti();
            mostrarGanador();
		}else if(div1Img === div5Img && div5Img === div9Img ){
			confetti();
            mostrarGanador();
		}else if(div3Img === div5Img && div5Img === div7Img ){
			confetti();
            mostrarGanador();
		}
}
function mostrarGanador(){
	var modal = document.getElementById("miModal");
	
	modal.style.display = 'block';
	modal.innerHTML = '<h1 class="text-ganador" >EL GANADOR ES :'+messagesender+'</h1>';
	modal.style.color = 'white';
	removerListeners();
}

function generarNumeroAleatorio() {
    // Genera un número aleatorio entre 1000 y 9999
    var numeroAleatorio = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    
    return numeroAleatorio;
}
