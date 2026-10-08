from typing import Dict, Any
from datetime import datetime
from enum import Enum

class BaseRepository:
    def _serialize_to_bson(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Convert ISO strings to datetime objects, enums to strings, and clean up nulls."""
        bson_doc = {}
        for k, v in doc.items():
            k_str = str(k)
            if v is None:
                bson_doc[k_str] = None
            elif isinstance(v, Enum):
                bson_doc[k_str] = v.value
            elif isinstance(v, str) and isinstance(k, str) and (k.endswith('_at') or k == 'timestamp'):
                try:
                    clean_str = v.replace('Z', '+00:00')
                    bson_doc[k_str] = datetime.fromisoformat(clean_str)
                except ValueError:
                    bson_doc[k_str] = v
            elif isinstance(v, list):
                bson_doc[k_str] = [
                    self._serialize_to_bson(item) if isinstance(item, dict)
                    else item.value if isinstance(item, Enum)
                    else item
                    for item in v
                ]
            elif isinstance(v, dict):
                bson_doc[k_str] = self._serialize_to_bson(v)
            else:
                bson_doc[k_str] = v
        return bson_doc

    def _deserialize_from_bson(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        """Convert datetime objects back to ISO strings and strip _id."""
        if not doc:
            return doc
        res = {}
        for k, v in doc.items():
            if k == '_id':
                continue
            if isinstance(v, datetime):
                # Format to our consistent UTC string ending in Z
                res[k] = v.isoformat().replace('+00:00', '') + "Z" if v.tzinfo is None else v.isoformat()
            elif isinstance(v, list):
                res[k] = [
                    self._deserialize_from_bson(item) if isinstance(item, dict)
                    else item
                    for item in v
                ]
            elif isinstance(v, dict):
                res[k] = self._deserialize_from_bson(v)
            else:
                res[k] = v
        return res
