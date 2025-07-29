class JobOpeningsController < ApplicationController
  before_action :set_job_opening, only: [:show, :update, :destroy]

  def index
    @job_openings = JobOpening.all
    render json: @job_openings
  end

  def show
    render json: @job_opening
  end

  def create
    @job_opening = JobOpening.new(job_opening_params)
    if @job_opening.save
      render json: @job_opening, status: :created
    else
      render json: @job_opening.errors, status: :unprocessable_entity
    end
  end

  def update
    if @job_opening.update(job_opening_params)
      render json: @job_opening
    else
      render json: @job_opening.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @job_opening.destroy
    head :no_content
  end

  private
    def set_job_opening
      @job_opening = JobOpening.find(params[:id])
    end

    def job_opening_params
      params.require(:job_opening).permit(:title, :department_id, :description, :status)
    end
end 