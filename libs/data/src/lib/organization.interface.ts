export interface Organization {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
}

export interface CreateOrganizationDto {
  name: string;
  parentId?: string;
}
