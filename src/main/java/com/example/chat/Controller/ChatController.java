package com.example.chat.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.chat.model.ChatMessage;

@Controller
public class ChatController {
	
	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/chat.sendMessage/{idsala}")
	public ChatMessage sendMessage(@Payload ChatMessage chatMessage, @DestinationVariable String idsala) {
		
		messagingTemplate.convertAndSend("/topic/public" + idsala, chatMessage);
		return chatMessage;
	}
	
	@MessageMapping("/chat.addUser/{idsala}")
	public ChatMessage addUser(@Payload ChatMessage chatMessage, @DestinationVariable String idsala, SimpMessageHeaderAccessor headerAccessor) {
		
		headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
		messagingTemplate.convertAndSend("/topic/public" + idsala, chatMessage);
		return chatMessage;
	}
}
