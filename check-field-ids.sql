-- Verificar field_id para tipificación
SELECT DISTINCT fev.field_id, COUNT(*) as count
FROM ost_form_entry_values fev
JOIN ost_list_items li ON fev.value LIKE CONCAT('%"', li.id, '"%')
WHERE li.id IN (92, 93, 94, 107, 127, 129, 131, 132)
GROUP BY fev.field_id
ORDER BY count DESC;

-- Ver ejemplos de valores
SELECT fev.field_id, fev.value, li.value as tipificacion
FROM ost_form_entry_values fev
JOIN ost_list_items li ON fev.value LIKE CONCAT('%"', li.id, '"%')
WHERE li.id IN (92, 93, 94, 107, 127, 129, 131, 132)
LIMIT 10;
