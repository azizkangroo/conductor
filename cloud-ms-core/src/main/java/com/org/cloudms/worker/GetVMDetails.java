package com.org.cloudms.worker;

import java.util.HashMap;
import java.util.LinkedHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.netflix.conductor.client.worker.Worker;
import com.netflix.conductor.common.metadata.tasks.Task;
import com.netflix.conductor.common.metadata.tasks.TaskResult;
import com.netflix.conductor.common.metadata.tasks.TaskResult.Status;

public class GetVMDetails implements Worker{
	
    private final String taskDefName;
    
    private Logger logger = LoggerFactory.getLogger(GetVMDetails.class);

    public GetVMDetails(String taskDefName) {
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
		String hostname=(String) task.getInputData().get("hostname");
		logger.info("Fetching vm-details for hostname:"+hostname);
        TaskResult result = new TaskResult(task);
        HashMap<String,Object> vmDetails=new LinkedHashMap<String,Object>();
        HashMap<String,Object> vmDetailsNest=new LinkedHashMap<String,Object>();
        vmDetailsNest.put("id", 1234);
        vmDetailsNest.put("name", "vm-1234");
        vmDetails.put("vmDetails", vmDetailsNest);

        // Register the output of the task
        result.getOutputData().put("id", 1234 );
        result.getOutputData().put("name", "vm-1234" );
        result.getOutputData().put("vmDetails", vmDetails );
        //result.addOutputData("vmDetails", vmDetails);
        logger.info(result.toString());
        result.setStatus(Status.COMPLETED);
        return result;
	}

}
