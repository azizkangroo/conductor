package com.org.cloudms.config;

import static java.lang.annotation.ElementType.TYPE;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

@Repeatable(WfTask.List.class)
@Retention(RUNTIME)
@Target(TYPE)
public @interface WfTask {
	String taskName();
	String description();

	@Retention(RUNTIME)
	@Target(TYPE)
	@interface List {
		WfTask[] value();
	}
}
