package com.infosys.polycloud.cloudms.config;

import java.util.List;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.support.AbstractBeanDefinition;
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.support.DefaultSingletonBeanRegistry;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import com.netflix.conductor.client.automator.TaskRunnerConfigurer;
import com.netflix.conductor.client.worker.Worker;

@Service
public class ConductorContextRefresh implements BeanFactoryAware{
	
	DefaultListableBeanFactory listableBeanFactory;
	
	TaskRunnerConfigurer taskRunnerConfigurer;
	
	@Autowired
	private ApplicationContext appContext;

	@Override
	public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
		listableBeanFactory = (DefaultListableBeanFactory) beanFactory;
	}
	
	  public TaskRunnerConfigurer updateTaskRunnerConfigurer(List<Worker> workers){
		  
		  //DefaultSingletonBeanRegistry registry = (DefaultSingletonBeanRegistry) appContext.getParentBeanFactory();
		  //registry.destroySingleton() ;//destroys the bean object
		  //registry.registerSingleton(); //add to singleton beans cache

		    AbstractBeanDefinition definition = BeanDefinitionBuilder
		        .genericBeanDefinition(TaskRunnerConfigurer.class)
		        .addPropertyValue("workers", WorkerHelper.addWorkers(workers))
		        .getBeanDefinition();

		    listableBeanFactory
		        .registerBeanDefinition("taskRunnerConfigurer", definition);

		    return taskRunnerConfigurer = listableBeanFactory
		        .getBean(TaskRunnerConfigurer.class);
		  }
	
}
