class CompaniesController < ApplicationController
  before_action :set_company

  def show
    render json: @company
  end

  def update
    if @company.update(company_params)
      render json: @company
    else
      render json: @company.errors, status: :unprocessable_entity
    end
  end

  private
    def set_company
      @company = Company.first_or_create
    end

    def company_params
      params.require(:company).permit(:name, :code, :industry, :employee_count, :address, :timezone, :currency)
    end
end 