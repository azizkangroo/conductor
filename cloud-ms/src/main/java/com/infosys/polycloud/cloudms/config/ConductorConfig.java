package com.infosys.polycloud.cloudms.config;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.type.filter.AnnotationTypeFilter;

import com.infosys.polycloud.cloudms.worker.GetVMDetails;
import com.netflix.conductor.client.automator.TaskRunnerConfigurer;
import com.netflix.conductor.client.http.TaskClient;
import com.netflix.conductor.client.worker.Worker;


@Configuration
public class ConductorConfig {
	
	private Logger logger = LoggerFactory.getLogger(ConductorConfig.class);
	
	@Value("${conductor.api.root:\"http://127.0.0.1:8080/api/\"}")
    private String conductorAPIRoot;
	
	
	@Value("${conductor.worker.packages:com.infosys.polycloud.worker}")
	private String workerPackages;
	
	private List<Worker> workers;
	
	
	@PostConstruct
	public void collectWorkers() throws ClassNotFoundException, InstantiationException, IllegalAccessException, IllegalArgumentException, InvocationTargetException, NoSuchMethodException, SecurityException {
		ClassPathScanningCandidateComponentProvider syncScanner = new ClassPathScanningCandidateComponentProvider(
				false);
		workers = new ArrayList<>();
		for (String wrkpackage : workerPackages.split(",")) {
			syncScanner.addIncludeFilter(new AnnotationTypeFilter(WfTask.class));
			for (BeanDefinition bd : syncScanner.findCandidateComponents(wrkpackage)) {
				Class<?> className = Class.forName(bd.getBeanClassName());
				workers.add((Worker) className.getDeclaredConstructor().newInstance());
			}
		}
		
	}
	
	
	@Bean
	public TaskClient taskClient() {
		TaskClient taskClient = new TaskClient();
		taskClient.setRootURI(conductorAPIRoot);  
		return taskClient;
	}

	@Bean(initMethod="init", destroyMethod="shutdown")
	public TaskRunnerConfigurer taskRunnerConfigurer(TaskClient taskClient) {
		int threadCount = 2;            //number of threads used to execute workers.  To avoid starvation, should be same or more than number of workers

        
        // Create TaskRunnerConfigurer
        //TaskRunnerConfigurer taskRunnerConfigurer = new TaskRunnerConfigurer.Builder(taskClient, workers)
		TaskRunnerConfigurer taskRunnerConfigurer = new TaskRunnerConfigurer.Builder(taskClient,Arrays.asList(new GetVMDetails("get_vm_details")))
            .withThreadCount(threadCount)
            .build();
		logger.info(String.format("Conductor registered with %d workers",workers.size()));
		return taskRunnerConfigurer;
	}
	
}
