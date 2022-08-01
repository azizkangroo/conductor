package com.org.cloudmsclient;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages ={"com.org.cloudms.config", "com.org.cloudms.worker"} )
public class CloudMsApplicationClient {

	public static void main(String[] args) {
		SpringApplication.run(CloudMsApplicationClient.class, args);
	}

}
