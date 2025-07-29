class AttendanceRecordsController < ApplicationController
  before_action :set_attendance_record, only: [:show, :update, :destroy]

  def index
    @attendance_records = AttendanceRecord.all
    render json: @attendance_records
  end

  def show
    render json: @attendance_record
  end

  def create
    @attendance_record = AttendanceRecord.new(attendance_record_params)
    if @attendance_record.save
      render json: @attendance_record, status: :created
    else
      render json: @attendance_record.errors, status: :unprocessable_entity
    end
  end

  def update
    if @attendance_record.update(attendance_record_params)
      render json: @attendance_record
    else
      render json: @attendance_record.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @attendance_record.destroy
    head :no_content
  end

  private
    def set_attendance_record
      @attendance_record = AttendanceRecord.find(params[:id])
    end

    def attendance_record_params
      params.require(:attendance_record).permit(:employee_id, :date, :status, :check_in, :check_out)
    end
end 