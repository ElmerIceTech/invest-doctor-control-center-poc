export interface InvestDoctorCreateInput {
  name: string
  alias: string
}

export interface InvestDoctor extends InvestDoctorCreateInput {
  id: string
  createdAtIso: string
}


