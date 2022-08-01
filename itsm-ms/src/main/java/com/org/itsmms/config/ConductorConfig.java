package com.org.itsmms.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.netflix.conductor.client.automator.TaskRunnerConfigurer;
import com.netflix.conductor.client.http.TaskClient;
import com.netflix.conductor.client.worker.Worker;
import com.org.itsmms.worker.UpdateCatalog;

@Configuration
public class ConductorConfig {
	
	@Bean
	public TaskClient taskClient() {
		TaskClient taskClient = new TaskClient();
		taskClient.setRootURI("http://127.0.0.1:8080/api/");  
		return taskClient;
	}

	@Bean(initMethod="init", destroyMethod="shutdown")
	public TaskRunnerConfigurer taskRunnerConfigurer(TaskClient taskClient) {
		int threadCount = 2;            //number of threads used to execute workers.  To avoid starvation, should be same or more than number of workers


        Worker worker4 = new UpdateCatalog("update_catalog");
        // Create TaskRunnerConfigurer
        TaskRunnerConfigurer configurer = new TaskRunnerConfigurer.Builder(taskClient, Arrays.asList(worker4))
            .withThreadCount(threadCount)
            .build();
		return configurer;
	}
	
}
