// @flow
import React, { createContext, useEffect, useState } from 'react';

type GlobalConstants = {
  backendApiUrlPrefix: string,
  frontendUrlPrefix: string,
  enableScheduling: boolean,
  disabledTasks: string[],
  prefixHttpTask: string,
};

export const globalConstants: GlobalConstants = {
  backendApiUrlPrefix: 'http://127.0.0.1:8080/api',
  frontendUrlPrefix: '/workflow/ui',
  enableScheduling: false,
  disabledTasks: ['js', 'py', 'while', 'while_end'],
  prefixHttpTask: '',
  // Uncomment below settings when testing frinx-workflow-ui running on host and talking to workflow-proxy in net-auto
  /*
  backendApiUrlPrefix: "/workflow/proxy",
  frontendUrlPrefix: "/workflow/frontend",
  enableScheduling: true,
  disabledTasks: ['lambda'],
  prefixHttpTask: 'GLOBAL___',
 */
};

export const GlobalContext = createContext<GlobalConstants>(globalConstants);

export const GlobalProvider = (props: GlobalConstants & { children: React$Node }) => {
  const { children, ...rest } = props;
  return <GlobalContext.Provider value={{ ...globalConstants, ...rest }}>{children}</GlobalContext.Provider>;
};
