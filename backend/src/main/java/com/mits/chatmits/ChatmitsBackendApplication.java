package com.mits.chatmits;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChatmitsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChatmitsBackendApplication.class, args);
	}

}
