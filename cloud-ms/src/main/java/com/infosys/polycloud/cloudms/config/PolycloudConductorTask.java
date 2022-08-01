package com.infosys.polycloud.cloudms.config;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.netflix.conductor.client.worker.Worker;
import com.netflix.conductor.common.metadata.tasks.Task;
import com.netflix.conductor.common.metadata.tasks.TaskResult;


public abstract class PolycloudConductorTask implements PolycloudTask,Worker {
	
	private Logger logger = LoggerFactory.getLogger(PolycloudConductorTask.class);

	@Override
	public String getTaskDefName() {
		return getClass().isAnnotationPresent(WfTask.class)?getClass().getAnnotation(WfTask.class).taskName():getClass().isAnnotationPresent(WfTask.class)?getClass().getAnnotation(WfTask.class).taskName():getClass().getName();
	}

	@Override
	public TaskResult execute(Task task) {
		Map<String,Object> inputMap = task.getInputData();
		TaskResult taskResult = new TaskResult(task);
		Object obj=null;
		Map<String,Object> outputMap =null;
		try {
			obj = this.execute(inputMap);
			outputMap = (Map<String,Object>) obj;
			switch (outputMap.get("taskStatus").toString()){
				case "COMPLETED": taskResult.setStatus(TaskResult.Status.COMPLETED);
					break;
				case "FAILED" : taskResult.setStatus(TaskResult.Status.FAILED);
					break;
				default: taskResult.setStatus(TaskResult.Status.IN_PROGRESS);
			}
			taskResult.setOutputData((Map<String, Object>) outputMap.get("outputData"));
		} catch (Exception e){
			logger.error("Failed to execute task",e.getMessage());
			taskResult.setReasonForIncompletion(e.getMessage());
		} finally {
			//taskResult.setStatus(TaskResult.Status.FAILED_WITH_TERMINAL_ERROR);
		}
		
		return taskResult;
	}
		

	@Override
	public abstract Object execute(Object inputObj) ;




	

}
