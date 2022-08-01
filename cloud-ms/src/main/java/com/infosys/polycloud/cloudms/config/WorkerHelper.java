package com.infosys.polycloud.cloudms.config;

import java.util.ArrayList;
import java.util.List;

import com.netflix.conductor.client.worker.Worker;

public class WorkerHelper {
	
	private static List<Worker> workerList;
	
	private WorkerHelper(List<Worker> workers) {
		this.workerList=new ArrayList<>();
		this.workerList.addAll(workers);
	}
	
	public static List<Worker> addWorkers(List<Worker> workers) {
		if(workerList==null) {
			new WorkerHelper(workers);
		}
		else {
			workerList.addAll(workers);
		}
		return workers;
	}
}
