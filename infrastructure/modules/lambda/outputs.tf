output "function_names" {
  value = [
    aws_lambda_function.iot_vitals_processor.function_name,
    aws_lambda_function.iot_checkins_processor.function_name,
    aws_lambda_function.alert_processor.function_name
  ]
}

output "vitals_processor_arn" {
  value = aws_lambda_function.iot_vitals_processor.arn
}

output "checkins_processor_arn" {
  value = aws_lambda_function.iot_checkins_processor.arn
}

output "alert_processor_arn" {
  value = aws_lambda_function.alert_processor.arn
}

output "alert_processor_function_name" {
  value = aws_lambda_function.alert_processor.function_name
}