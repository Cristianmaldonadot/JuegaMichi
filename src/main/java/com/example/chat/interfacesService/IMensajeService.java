package com.example.chat.interfacesService;

import java.util.List;

import com.example.chat.model.Mensaje;

public interface IMensajeService {
	
	public Mensaje registrarMensaje(Mensaje men);
	public List<Mensaje> listarMensajes();

}
