package com.infosys.polycloud.cloudms.worker;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.infosys.polycloud.cloudms.config.PolycloudConductorTask;
import com.infosys.polycloud.cloudms.config.WfTask;
import com.netflix.conductor.common.metadata.tasks.TaskResult.Status;

@WfTask(taskName = "get_vm_details",description = "Task to get VM details")
public class GetVmDetailsTask extends PolycloudConductorTask {
	
	 private Logger logger = LoggerFactory.getLogger(GetVmDetailsTask.class);


	@Override
	public Object execute(Object inputObj) {
		// TODO Auto-generated method stub
		Map<String,Object> input=(Map<String, Object>)inputObj;
		logger.info(input.toString());
		String hostname=input.get("hostname").toString();
		logger.info(hostname);
		HashMap<String,Object> vmDetails=new LinkedHashMap<String,Object>();
        HashMap<String,Object> vmDetailsNest=new LinkedHashMap<String,Object>();
        vmDetailsNest.put("id", 1234);
        vmDetailsNest.put("name", "vm-1234");
        vmDetails.put("vmDetails", vmDetailsNest);

        Map<String,Object> result=new LinkedHashMap<>();
        // Register the output of the task
        Map<String,Object> outputData=new LinkedHashMap<>();
        outputData.put("id", 1234 );
        outputData.put("name", "vm-1234" );
        outputData.put("vmDetails", vmDetails);
        result.put("outputData", outputData);
        logger.info(result.toString());
        result.put("taskStatus",Status.COMPLETED);
        return result;
	}

}
