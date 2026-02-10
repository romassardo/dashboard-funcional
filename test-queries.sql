-- Test queries para debug

-- 1. Total de tickets
SELECT COUNT(*) as total_tickets FROM ost_ticket;

-- 2. Verificar estructura de form_entry
SELECT COUNT(*) as total_entries FROM ost_form_entry WHERE object_type = 'T';

-- 3. Verificar field_id 55
SELECT COUNT(*) FROM ost_form_entry_values WHERE field_id = 55;

-- 4. Ver valores del field_id 55
SELECT fev.value, COUNT(*) as count 
FROM ost_form_entry_values fev 
WHERE fev.field_id = 55 
GROUP BY fev.value 
LIMIT 10;

-- 5. Verificar list_items para Sistema
SELECT id, value FROM ost_list_items WHERE id IN (86, 88, 89, 90, 91, 106);

-- 6. Query completa de tickets por sistema (simplificada)
SELECT 
  li.value as sistema,
  COUNT(t.ticket_id) as cantidad
FROM ost_ticket t
JOIN ost_form_entry fe ON t.ticket_id = fe.object_id AND fe.object_type = 'T'
JOIN ost_form_entry_values fev ON fe.id = fev.entry_id
JOIN ost_list_items li ON fev.value = li.id
WHERE fev.field_id = 55
  AND li.id IN (86, 88, 89, 90, 91, 106)
GROUP BY li.value, li.id
ORDER BY cantidad DESC;
