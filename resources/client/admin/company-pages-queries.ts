import {apiClient, queryClient} from '@common/http/query-client';
import {mutationOptions, queryOptions} from '@tanstack/react-query';

export const companyPageSeoBaseKey = ['company-page-seo'];

export type CompanyPageSeoItem = {
  path: string;
  slug: string;
  label: string;
  group: string;
  default_title: string;
  default_description: string;
  title: string;
  description: string;
  is_overridden: boolean;
};

export type CompanyPageSeoUpdateBody = {
  path: string;
  title: string;
  description: string;
};

export const listCompanyPageSeoOptions = () => {
  return queryOptions({
    queryKey: companyPageSeoBaseKey,
    queryFn: () =>
      apiClient
        .get<{data: CompanyPageSeoItem[]}>('company-page-seo')
        .then(r => r.data.data),
  });
};

export const saveCompanyPageSeoOptions = () => {
  return mutationOptions({
    mutationFn: (body: CompanyPageSeoUpdateBody) =>
      apiClient.put('company-page-seo', body).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: companyPageSeoBaseKey});
    },
  });
};

export const resetCompanyPageSeoOptions = () => {
  return mutationOptions({
    mutationFn: (path: string) =>
      apiClient.delete('company-page-seo', {params: {path}}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: companyPageSeoBaseKey});
    },
  });
};
