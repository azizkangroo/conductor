package com.org.itsmms.worker;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.netflix.conductor.client.worker.Worker;
import com.netflix.conductor.common.metadata.tasks.Task;
import com.netflix.conductor.common.metadata.tasks.TaskResult;
import com.netflix.conductor.common.metadata.tasks.TaskResult.Status;

public class UpdateCatalog implements Worker{
	
    private final String taskDefName;

    
    private Logger logger = LoggerFactory.getLogger(UpdateCatalog.class);

    public UpdateCatalog(String taskDefName) {
        this.taskDefName = taskDefName;
    }

	@Override
	public String getTaskDefName() {
		// TODO Auto-generated method stub
		return taskDefName;
	}

	@Override
	public TaskResult execute(Task task) {
		logger.info(task.getInputData().toString());
		
        TaskResult result = new TaskResult(task);
        result.setStatus(Status.COMPLETED);


        // Register the output of the task
        result.addOutputData("vmDetails",task.getInputData().get("vmDetails"));
        logger.info(result.toString());
        return result;
	}

}
