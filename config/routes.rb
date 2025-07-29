Rails.application.routes.draw do
  resources :employees
  resources :departments
  resources :job_openings
  resources :leave_requests
  resources :salary_structures
  resources :payrolls
  resources :attendance_records
  resource :company, only: [:show, :update]
end 