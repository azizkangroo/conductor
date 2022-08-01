package com.netflix.conductor.rest.config;

import java.util.Arrays;
import java.util.List;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;


@Configuration
public class CorsConfig {
	private String allowedOrigins = "*";
	private String allowedHeaders = "*";
	private String allowedMethods = "*";
	
	//Why i had done this.
	//Please refer the below link
	//https://github.com/spring-projects/spring-security-oauth/issues/938
	@Bean
	public FilterRegistrationBean customCorsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowCredentials(true);
			config.addAllowedOrigin(allowedOrigins);
			config.addAllowedHeader(allowedHeaders);
			config.addAllowedMethod(allowedMethods);
		source.registerCorsConfiguration("/**", config);
		FilterRegistrationBean bean = new FilterRegistrationBean(new CorsFilter(source));

		// IMPORTANT #2: I didn't stress enough the importance of this line in my
		// original answer,
		// but it's here where we tell Spring to load this filter at the right point in
		// the chain
		// (with an order of precedence higher than oauth2's filters)
		bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
		return bean;
	}

}
