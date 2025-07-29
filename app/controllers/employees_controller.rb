class EmployeesController < ApplicationController
  before_action :set_employee, only: [:show, :update, :destroy]

  def index
    @employees = Employee.all
    render json: @employees.as_json, status: :ok
  end

  def show
    render json: @employee
  end

  def create
    @employee = Employee.new(employee_params)
    if @employee.save!
      render json: @employee, status: :created
    else
      render json: @employee.errors, status: :unprocessable_entity
    end
  end

  def update
    if @employee.update(employee_params)
      render json: @employee
    else
      render json: @employee.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @employee.destroy
    head :no_content
  end

  private

  def set_employee
    @employee = Employee.find(params[:id])
  end

  def employee_params
    params.require(:employee)
          .permit(:first_name, :last_name, :email, :phone,
                  :department_id, :designation,
                  :date_of_joining, :status)
  end
end 